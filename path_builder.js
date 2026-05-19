class PathBuilder {
    constructor(onChange) {
        this.onChange = onChange || (() => {});
        this.blocks = [];
        this.container = document.getElementById('program-list');
        this.placeholder = document.getElementById('program-placeholder');
        this.render();
    }

    addBlock(type) {
        this.blocks.push({ type, count: type === 'repeat' ? 3 : null });
        this.render();
        this.onChange();
    }

    removeBlock(index) {
        this.blocks.splice(index, 1);
        this.render();
        this.onChange();
    }

    setRepeatCount(index, delta) {
        const b = this.blocks[index];
        b.count = Math.max(1, Math.min(99, b.count + delta));
        this.render();
        this.onChange();
    }

    compile() {
        let result = '';
        let i = 0;
        while (i < this.blocks.length) {
            const b = this.blocks[i];
            if (b.type === 'repeat') {
                const inner = this.compileFrom(i + 1);
                result += inner.str.repeat(b.count);
                i = inner.next;
            } else {
                const map = { forward: 'f', turnLeft: 'l', turnRight: 'r', wait: 'w' };
                result += map[b.type] || '';
                i++;
            }
        }
        return result;
    }

    compileFrom(idx) {
        if (idx >= this.blocks.length) return { str: '', next: idx };
        const b = this.blocks[idx];
        if (b.type === 'repeat') {
            const inner = this.compileFrom(idx + 1);
            return { str: inner.str.repeat(b.count), next: inner.next };
        }
        const map = { forward: 'f', turnLeft: 'l', turnRight: 'r', wait: 'w' };
        return { str: map[b.type] || '', next: idx + 1 };
    }

    clear() {
        this.blocks = [];
        this.render();
        this.onChange();
    }

    isRepeatTarget(idx) {
        return idx > 0 && this.blocks[idx - 1].type === 'repeat'
            && this.blocks[idx].type !== 'repeat';
    }

    render() {
        this.container.innerHTML = '';
        let i = 0;
        while (i < this.blocks.length) {
            if (this.isRepeatTarget(i)) { i++; continue; }
            i = this.renderBlock(i);
        }
        this.placeholder.style.display = this.blocks.length ? 'none' : 'flex';
    }

    renderBlock(idx) {
        const b = this.blocks[idx];
        const el = document.createElement('div');
        el.className = 'block-instance';

        if (b.type === 'repeat') {
            el.classList.add('is-repeat');
            this.buildRepeatUI(el, b, idx);
            const next = idx + 1;
            if (next < this.blocks.length && this.blocks[next].type !== 'repeat') {
                const childEl = this.buildBlockEl(next, true);
                const wrap = document.createElement('div');
                wrap.className = 'children';
                wrap.appendChild(childEl);
                el.appendChild(wrap);
                this.container.appendChild(el);
                return idx + 2;
            }
            this.container.appendChild(el);
            return idx + 1;
        }

        this.buildStandardUI(el, b, idx);
        this.container.appendChild(el);
        return idx + 1;
    }

    buildBlockEl(idx, isNested) {
        const b = this.blocks[idx];
        const el = document.createElement('div');
        el.className = 'block-instance' + (isNested ? ' nested' : '');
        this.buildStandardUI(el, b, idx);
        this.addRemoveBtn(el, idx);
        return el;
    }

    buildStandardUI(el, b, idx) {
        const icons = { forward: 'fa-arrow-up', turnLeft: 'fa-undo', turnRight: 'fa-redo', wait: 'fa-pause' };
        const labels = { forward: 'Forward', turnLeft: 'Turn Left', turnRight: 'Turn Right', wait: 'Wait' };

        const icon = document.createElement('i');
        icon.className = 'fa-solid ' + (icons[b.type] || 'fa-question');
        el.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'block-label';
        label.textContent = labels[b.type] || b.type;
        el.appendChild(label);

        if (!el.classList.contains('nested')) {
            this.addRemoveBtn(el, idx);
        }
    }

    buildRepeatUI(el, b, idx) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-repeat';
        el.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'block-label';
        label.textContent = 'Repeat';
        el.appendChild(label);

        const ctrl = document.createElement('div');
        ctrl.className = 'repeat-controls';
        const dec = document.createElement('button');
        dec.innerHTML = '<i class="fa-solid fa-minus"></i>';
        dec.addEventListener('click', e => { e.stopPropagation(); this.setRepeatCount(idx, -1); });
        ctrl.appendChild(dec);
        const cnt = document.createElement('span');
        cnt.className = 'repeat-count';
        cnt.textContent = b.count;
        ctrl.appendChild(cnt);
        const inc = document.createElement('button');
        inc.innerHTML = '<i class="fa-solid fa-plus"></i>';
        inc.addEventListener('click', e => { e.stopPropagation(); this.setRepeatCount(idx, 1); });
        ctrl.appendChild(inc);
        el.appendChild(ctrl);

        this.addRemoveBtn(el, idx);
    }

    addRemoveBtn(el, idx) {
        const rm = document.createElement('button');
        rm.className = 'remove-block';
        rm.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        rm.addEventListener('click', e => { e.stopPropagation(); this.removeBlock(idx); });
        el.appendChild(rm);
    }
}
