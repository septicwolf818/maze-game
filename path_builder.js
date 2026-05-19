class PathBuilder {
    constructor(onChange) {
        this.onChange = onChange || (() => {});
        this.blocks = [];
        this.container = document.getElementById('program-list');
        this.placeholder = document.getElementById('program-placeholder');

        this.dragState = null;
        this._onMove = (e) => this._dragMove(e);
        this._onEnd = (e) => this._dragEnd(e);

        this.render();
    }

    /* ── Public API ─────────────────────── */

    addBlock(type) {
        if (type === 'repeat') {
            this.blocks.push({ type: 'repeat', count: 3, blocks: [] });
        } else {
            this.blocks.push({ type });
        }
        this.render();
        this.onChange();
    }

    addBlockTo(blocks, type) {
        if (type === 'repeat') {
            blocks.push({ type: 'repeat', count: 3, blocks: [] });
        } else {
            blocks.push({ type });
        }
        this.render();
        this.onChange();
    }

    removeBlock(blocks, index) {
        blocks.splice(index, 1);
        this.render();
        this.onChange();
    }

    setRepeatCount(blocks, index, delta) {
        const b = blocks[index];
        b.count = Math.max(1, Math.min(99, b.count + delta));
        this.render();
        this.onChange();
    }

    compile() {
        return this._compileBlocks(this.blocks).join('');
    }

    _compileBlocks(blocks) {
        const map = { forward: 'f', turnLeft: 'l', turnRight: 'r', wait: 'w' };
        const out = [];
        for (const b of blocks) {
            if (b.type === 'repeat') {
                for (let i = 0; i < b.count; i++) {
                    out.push(...this._compileBlocks(b.blocks));
                }
            } else {
                out.push(map[b.type] || '');
            }
        }
        return out;
    }

    clear() {
        this.blocks = [];
        this.render();
        this.onChange();
    }

    /* ── Rendering ──────────────────────── */

    render() {
        this.container.innerHTML = '';
        this._renderBlocks(this.blocks, this.container, false);
        this.placeholder.style.display = this.blocks.length ? 'none' : 'flex';
    }

    _renderBlocks(blocks, parentEl, nested) {
        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const el = document.createElement('div');
            el.className = 'block-instance' + (nested ? ' nested' : '');

            /* drag start via closure (captures blocks, i, el, parentEl) */
            const onDown = (e) => {
                if (e.target.closest('button')) return;
                this._startDrag(blocks, i, el, parentEl, e);
            };
            el.addEventListener('mousedown', onDown);
            el.addEventListener('touchstart', onDown, { passive: true });

            /* icon */
            const icon = document.createElement('i');
            const ic = {
                forward: 'fa-arrow-up', turnLeft: 'fa-undo',
                turnRight: 'fa-redo', wait: 'fa-pause', repeat: 'fa-repeat',
            };
            icon.className = 'fa-solid ' + (ic[b.type] || 'fa-question');
            el.appendChild(icon);

            /* label */
            const label = document.createElement('span');
            label.className = 'block-label';
            const lb = {
                forward: 'Forward', turnLeft: 'Turn Left',
                turnRight: 'Turn Right', wait: 'Wait', repeat: 'Repeat',
            };
            label.textContent = lb[b.type] || b.type;
            el.appendChild(label);

            if (b.type === 'repeat') {
                el.classList.add('is-repeat');

                /* repeat controls */
                const ctrl = document.createElement('div');
                ctrl.className = 'repeat-controls';
                const dec = document.createElement('button');
                dec.innerHTML = '<i class="fa-solid fa-minus"></i>';
                dec.addEventListener('click', e => { e.stopPropagation(); this.setRepeatCount(blocks, i, -1); });
                ctrl.appendChild(dec);
                const cnt = document.createElement('span');
                cnt.className = 'repeat-count';
                cnt.textContent = b.count;
                ctrl.appendChild(cnt);
                const inc = document.createElement('button');
                inc.innerHTML = '<i class="fa-solid fa-plus"></i>';
                inc.addEventListener('click', e => { e.stopPropagation(); this.setRepeatCount(blocks, i, 1); });
                ctrl.appendChild(inc);
                el.appendChild(ctrl);

                /* child blocks */
                if (b.blocks.length > 0) {
                    const childWrap = document.createElement('div');
                    childWrap.className = 'children';
                    this._renderBlocks(b.blocks, childWrap, true);
                    el.appendChild(childWrap);
                }

                /* inline [+] buttons */
                const addRow = document.createElement('div');
                addRow.className = 'inline-add-row';
                for (const [t, ic2] of [
                    ['forward', 'fa-arrow-up'],
                    ['turnLeft', 'fa-undo'],
                    ['turnRight', 'fa-redo'],
                    ['wait', 'fa-pause'],
                    ['repeat', 'fa-repeat'],
                ]) {
                    const btn = document.createElement('button');
                    btn.innerHTML = `<i class="fa-solid ${ic2}"></i>`;
                    btn.addEventListener('click', e => { e.stopPropagation(); this.addBlockTo(b.blocks, t); });
                    addRow.appendChild(btn);
                }
                el.appendChild(addRow);
            }

            /* remove */
            const rm = document.createElement('button');
            rm.className = 'remove-block';
            rm.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            rm.addEventListener('click', e => { e.stopPropagation(); this.removeBlock(blocks, i); });
            el.appendChild(rm);

            parentEl.appendChild(el);
        }
    }

    /* ── Drag-and-drop ──────────────────── */

    _startDrag(blocks, idx, el, parentEl, e) {
        if (this.dragState) return;
        const pos = e.touches ? e.touches[0] : e;

        this.dragState = {
            parent: blocks,
            parentEl,
            srcIdx: idx,
            tgtIdx: idx,
            startY: pos.clientY,
            el,
            clone: null,
            marker: null,
            offY: 0,
        };

        document.addEventListener('mousemove', this._onMove);
        document.addEventListener('mouseup', this._onEnd);
        document.addEventListener('touchmove', this._onMove, { passive: false });
        document.addEventListener('touchend', this._onEnd);
    }

    _dragMove(e) {
        const st = this.dragState;
        if (!st) return;
        e.preventDefault();
        const pos = e.touches ? e.touches[0] : e;

        /* first move: hide source, create floating clone */
        if (!st.clone) {
            const rect = st.el.getBoundingClientRect();
            st.sourceHeight = rect.height;

            const clone = st.el.cloneNode(true);
            clone.className = 'block-instance drag-clone';
            clone.style.cssText =
                'position:fixed;z-index:1000;pointer-events:none;' +
                `width:${rect.width}px;left:${rect.left}px;top:${rect.top}px`;
            document.body.appendChild(clone);
            st.clone = clone;
            st.offY = pos.clientY - rect.top;

            st.el.style.display = 'none';
        }

        /* move clone */
        st.clone.style.top = (pos.clientY - st.offY) + 'px';

        /* siblings visible in the DOM for hit-testing */
        const siblings = [...st.parentEl.querySelectorAll(':scope > .block-instance')]
            .filter(el => el.style.display !== 'none' && !el.classList.contains('drag-ph'));

        let newIdx = siblings.length;
        for (let i = 0; i < siblings.length; i++) {
            const r = siblings[i].getBoundingClientRect();
            if (pos.clientY < r.top + r.height / 2) {
                newIdx = i;
                break;
            }
        }
        st.tgtIdx = newIdx;

        /* insert / move the live placeholder so blocks shift */
        if (!st.ph) {
            const ph = document.createElement('div');
            ph.className = 'block-instance drag-ph';
            ph.style.height = st.sourceHeight + 'px';
            st.parentEl.insertBefore(ph, siblings[newIdx] || null);
            st.ph = ph;
        } else {
            st.parentEl.insertBefore(st.ph, siblings[newIdx] || null);
        }
    }

    _dragEnd() {
        const st = this.dragState;
        if (!st) return;

        if (st.ph) st.ph.remove();
        if (st.el) st.el.style.display = '';

        const moved = st.tgtIdx !== st.srcIdx && st.tgtIdx >= 0;
        if (moved) {
            const item = st.parent.splice(st.srcIdx, 1)[0];
            const insertAt = st.tgtIdx > st.srcIdx ? st.tgtIdx - 1 : st.tgtIdx;
            st.parent.splice(insertAt, 0, item);
        }

        this._dragCleanup();

        if (moved) {
            this.render();
            this.onChange();
        }
    }

    _dragCleanup() {
        if (!this.dragState) return;
        const st = this.dragState;
        if (st.ph) st.ph.remove();
        if (st.el) { st.el.style.display = ''; st.el.style.opacity = ''; }
        if (st.clone) st.clone.remove();
        this.dragState = null;
        document.removeEventListener('mousemove', this._onMove);
        document.removeEventListener('mouseup', this._onEnd);
        document.removeEventListener('touchmove', this._onMove);
        document.removeEventListener('touchend', this._onEnd);
    }
}
