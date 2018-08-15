((window) => {
    class Alert {
        constructor(content, type = 'success') {
            this.element = this.createElement(content, type);
            document.body.appendChild(this.element);
    
            setTimeout(() => this.remove(), 4000);
        }
    
        createElement(content, type) {
            const boxEl = document.createElement('div');
            boxEl.classList.add('alert-box', `alert-${type}`);
    
            const textEl = document.createElement('p');
            textEl.innerHTML = content;
    
            boxEl.appendChild(textEl);
            
            return boxEl;
        }
        
        remove() {
            this.element.remove();
        }
    }
    
    class Highlighter {
        constructor() {
            this.highlightedLines = [];
        }
    
        highlight(start, end) {
            const linesToHighlight = Array.from({
                length: (end || start) - start + 1
            }).map((value, key) => `L${key + start}`);
    
            linesToHighlight.forEach((line) => {
                const lineElement = document.getElementById(line);
    
                if (!lineElement) {
                    return;
                }
    
                lineElement.classList.add('hightlight');
                this.highlightedLines.push(lineElement);
            });
        }
    
        dehighlight() {
            this.highlightedLines.forEach(line => line.classList.remove('highlight'));
        }
    }
    
    class App {
        constructor() {
            window.addEventListener('load', () => this.checkLinesHash());
            window.addEventListener('hashchange', () => this.checkLinesHash());
    
            this.highlighter = new Highlighter();
            this.alert = new Alert();
        }
    
        checkLinesHash() {
            const lines = this.getLinesFromHash();
            
            if (lines) {
                this.highlighter.highlight(lines[0], lines[1]);
                this.scrollToLine(lines[0]);
            }
        }
    
        getLinesFromHash() {
            const hash = window.location.hash;
    
            if (hash && /^#L\d+(-\d+)?$/.test(hash)) {
                return hash.substring(2).split('-').map(V => parseInt(V, 10));
            } else {
                return null;
            }
        }
    
        scrollToLine(line) {
            const lineElement = document.getElementById(`L${line}`);
    
            if (lineElement) {
                lineElement.scrollIntoView();
            }
        }
    }
})(window);
