function setUrlHashForLines(start, end = null) {
    let hashValue = 'L' + start;

    if (end) {
        hashValue += '-' + end;
    }

    // Use history.replaceState instead of setting
    // window.location.hash to prevent page scroll
    const urlWithNoHash = document.location.href.split('#', 2)[0];

    history.replaceState({}, document.title, urlWithNoHash + '#' + hashValue);

    // ...since window.location.hash was not changed
    // we need to trigger associated function here
    highlightLine(hashValue.substring(1));
}


document.body.querySelectorAll('.alert-box').forEach(function (element) {
    autoHideAlert(element);
});

document.body.addEventListener('click', function (e) {
    if (e.target.matches('.alert-box')) {
        e.target.parentElement.removeChild(e.target);
    }
});

let lastHighlightedLine = null;
document.body.addEventListener('click', function (e) {
    if (e.target.matches('.counter')) {
        const lineNumber = e.target.getAttribute('data-ln');

        if (window.event.ctrlKey && lastHighlightedLine !== null) {
            // Make sure that lines are sorted ascending
            let lines = [];

            lines[0] = lastHighlightedLine;
            lines[1] = lineNumber;
            lines.sort(function (a, b) {
                return a - b;
            });

            setUrlHashForLines(...lines);
            lastHighlightedLine = null;
        } else {
            deHighlightLines();

            setUrlHashForLines(lineNumber);
            lastHighlightedLine = lineNumber;
        }
    }
});

if (document.getElementById('key') !== null && document.getElementById('key-save') !== null) {
    document.getElementById('key').value = window.localStorage.getItem("key");
    document.getElementById('key-save').addEventListener('click', function(e) {
        window.localStorage.setItem('key', document.getElementById('key').value);
        e.stopPropagation();
        e.preventDefault();

        createAlert('The key has been saved in LocalStorage and will be automatically supplied in the future.');
    });
}
