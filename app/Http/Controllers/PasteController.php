<?php

namespace App\Http\Controllers;

use App\Models\Paste;
use App\Services\Highlighter;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;

class PasteController extends Controller
{
    public function create()
    {
        return view('create');
    }

    public function store(Request $request, Highlighter $highlighter)
    {
        if ($request->file('paste')) {
            $file = $request->file('paste');

            if ($file->getSize() > 64 * 1024) {
                throw new PostTooLargeException();
            }

            $title = $file->getFilename();
            $content = $file->get();
            $language = $highlighter->getLanguageNameByMime($file->getMimeType());
        } else {
            $title = $request->get('title');
            $content = $request->get('content') ?? '';
            $language = $highlighter->normalizeLanguageName($request->get('language'));
        }

        $paste = new Paste();
        $paste->author = $request->get('author');
        $paste->title = $title;
        $paste->description = $request->get('description');
        $paste->language = $language;
        $paste->key = bcrypt($request->get('key'));
        $paste->content = $content;
        $paste->save();

        return redirect()
            ->route('show', $paste->slug)
            ->with('alert', 'Paste has been created');
    }

    public function show(Paste $paste, Highlighter $highlighter)
    {
        return view('show', [
            'content' => $highlighter->highlight($paste->content, $paste->language),
            'paste' => $paste,
            'title' => $paste->title,
        ]);
    }

    public function showRaw(Paste $paste)
    {
        return response($paste->content)
            ->header('Content-Type', 'text/plain');
    }

    public function download(Paste $paste)
    {
        return response()
            ->streamDownload(function () use ($paste) {
                echo $paste->content;
            }, "{$paste->slug}.txt");
    }

    public function edit(Paste $paste)
    {
        if (! $paste->key) {
            return redirect()
                ->back()
                ->with('alert', 'Pastes which were given no key during their creation cannot be edited')
                ->with('alert-type', 'error');
        }

        return view('edit', [
            'paste' => $paste,
            'title' => page_title('edit'),
        ]);
    }

    public function update(Request $request, Paste $paste, Highlighter $highlighter)
    {
        if (! $paste->key) {
            return redirect()
                ->back()
                ->with('alert', 'Pastes which were given no key during their creation cannot be edited')
                ->with('alert-type', 'error');
        }

        if (password_verify($request->get('key'), $paste->key) === false) {
            return redirect()
                ->back()
                ->with('alert', 'The given key is invalid')
                ->with('alert-type', 'error');
        }

        $paste->author = $request->get('author');
        $paste->title = $request->get('title');
        $paste->description = $request->get('description');
        $paste->language = $highlighter->normalizeLanguageName($request->get('language'));
        $paste->content = $request->get('content') ?? '';
        $paste->save();

        return redirect()
            ->route('show', $paste->slug)
            ->with('alert', 'Paste has been updated');
    }
}
