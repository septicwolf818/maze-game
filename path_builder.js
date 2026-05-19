class PathBuilder {
    constructor(onChange) {
        this.onChange = onChange || (() => {});
        this.root = { blocks: [], parent: null };
        this.activeScope = this.root;
        this.container = document.getElementById('program-list');
        this.placeholder = document.getElementById('program-placeholder');
        this.scopeLabel = document.getElementById('scope-label');
        this.render();
    }

    addBlock(type) {
        if (type === 'repeat') {
            const childScope = { blocks: [], parent: this.activeScope };
            this.activeScope.blocks.push({ type: 'repeat', count: 3, childScope });
        } else {
            this.activeScope.blocks.push({ type });
        }
        this.render();
        this.onChange();
    }

    removeBlock(scope, index) {
        const block = scope.blocks[index];
        if (block.childScope) {
            let s = this.activeScope;
            while (s) {
                if (s === block.childScope) {
                    this.activeScope = scope;
                    break;
                }
                s = s.parent;
            }
        }
        scope.blocks.splice(index, 1);
        this.render();
        this.onChange();
    }

    setRepeatCount(scope, index, delta) {
        const block = scope.blocks[index];
        block.count = Math.max(1, Math.min(99, block.count + delta));
        this.render();
        this.onChange();
    }

    setActiveScope(scope) {
        this.activeScope = scope;
        this.render();
    }

    compile() {
        return this.compileScope(this.root).join('');
    }

    compileScope(scope) {
        const result = [];
        for (const block of scope.blocks) {
            if (block.type === 'repeat') {
                for (let i = 0; i < block.count; i++) {
                    result.push(...this.compileScope(block.childScope));
                }
            } else {
                const map = { forward: 'f', turnLeft: 'l', turnRight: 'r' };
                result.push(map[block.type] || '');
            }
        }
        return result;
    }

    clear() {
        this.root.blocks = [];
        this.activeScope = this.root;
        this.render();
        this.onChange();
    }

    render() {
        this.container.innerHTML = '';
        this.renderScope(this.root, this.container, false);
        const hasBlocks = this.root.blocks.length > 0;
        this.placeholder.style.display = hasBlocks ? 'none' : 'flex';
        this.scopeLabel.textContent = this.getScopePath();
    }

    renderScope(scope, parentEl, isNested) {
        for (let i = 0; i < scope.blocks.length; i++) {
            const block = scope.blocks[i];
            const el = document.createElement('div');
            el.className = 'block-instance' + (isNested ? ' nested' : '') +
                (block.type === 'repeat' ? ' is-repeat' : '');

            const icon = document.createElement('span');
            icon.className = 'block-icon';
            icon.textContent = ({ forward: '↑', turnLeft: '↰', turnRight: '↱', repeat: '⟳' })[block.type] || '?';
            el.appendChild(icon);

            const label = document.createElement('span');
            label.className = 'block-label';
            label.textContent = ({
                forward: 'Forward', turnLeft: 'Turn Left',
                turnRight: 'Turn Right', repeat: 'Repeat'
            })[block.type] || block.type;
            el.appendChild(label);

            if (block.type === 'repeat') {
                const controls = document.createElement('div');
                controls.className = 'repeat-controls';

                const dec = document.createElement('button');
                dec.textContent = '−';
                dec.addEventListener('click', e => {
                    e.stopPropagation();
                    this.setRepeatCount(scope, i, -1);
                });
                controls.appendChild(dec);

                const cnt = document.createElement('span');
                cnt.className = 'repeat-count';
                cnt.textContent = block.count;
                controls.appendChild(cnt);

                const inc = document.createElement('button');
                inc.textContent = '+';
                inc.addEventListener('click', e => {
                    e.stopPropagation();
                    this.setRepeatCount(scope, i, 1);
                });
                controls.appendChild(inc);

                el.appendChild(controls);

                const childrenEl = document.createElement('div');
                childrenEl.className = 'children';
                el.appendChild(childrenEl);

                const isActive = this.activeScope === block.childScope;

                const hint = document.createElement('div');
                hint.style.cssText =
                    'padding:6px;font-size:11px;color:var(--text-dim);' +
                    'text-align:center;font-style:italic;cursor:pointer;border-radius:4px;';
                hint.textContent = 'Click to add blocks inside loop';
                hint.addEventListener('click', e => {
                    e.stopPropagation();
                    this.setActiveScope(block.childScope);
                });

                if (isActive || block.childScope.blocks.length > 0) {
                    hint.style.display = 'none';
                }
                childrenEl.appendChild(hint);

                if (isActive) {
                    const activeHint = document.createElement('div');
                    activeHint.style.cssText =
                        'padding:4px 6px;font-size:10px;color:var(--accent);' +
                        'text-align:center;border:1px dashed var(--accent);border-radius:4px;';
                    activeHint.textContent = '⬇ Adding blocks here';
                    childrenEl.appendChild(activeHint);
                }

                if (block.childScope.blocks.length > 0) {
                    this.renderScope(block.childScope, childrenEl, true);
                }
            }

            const rm = document.createElement('button');
            rm.className = 'remove-block';
            rm.textContent = '✕';
            rm.addEventListener('click', e => {
                e.stopPropagation();
                this.removeBlock(scope, i);
            });
            el.appendChild(rm);

            parentEl.appendChild(el);
        }
    }

    getScopePath() {
        const parts = [];
        let s = this.activeScope;
        while (s && s !== this.root) {
            parts.unshift('Loop');
            s = s.parent;
        }
        parts.unshift('Program');
        return parts.join(' > ');
    }
}
