(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.QALDistance = factory());
})(this, (function () { 'use strict';

    const keyboardLayouts = {
        qwerty: [
            "qwertyuiop",
            "asdfghjkl",
            "zxcvbnm,."
        ],
        azerty: [
            "azertyuiop",
            "qsdfghjklmù",
            "wxcvbn.,",
        ],
        "йцукен": [
            "йцукенгшщзхъ",
            "фывапролджэ",
            "ячсмитьбю.",
        ]
    };

    class QALDistance {
        options = {};

        constructor(options = {}) {
            const defaultOptions = {
                misspells: {},
                layout: "qwerty",
                comparer: {
                    enabled: true,
                    tags: {
                        addition: (k) => `<u>${k}</u>`,
                        deletion: false,
                        replacement: (k) => `<u>${k}</u>`
                    }
                }
            };

            this.options = Object.fromEntries(
                Object.entries(defaultOptions).map(([k, v]) => k in options ? [k, options[k]] : [k, v])
            );
        };

        compute(str1, str2) {
            const s = str1.toLowerCase(), t = str2.toLowerCase();

            if (!s.length) return t.length;
            if (!t.length) return s.length;

            const matrix = [];

            for (let i = 0; i <= t.length; i++) {
                matrix[i] = [i];
                for (let j = 1; j <= s.length; j++) {
                    matrix[i][j] = i === 0 ? j : Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                    );
                }
            }

            let distance = matrix[t.length][s.length];
            const changes = {};

            let _row = t.length;
            let _col = s.length;
            const getSiblings = () => {
                /* | a | b |
                   +---+---+
                   | c | d | */
                return {
                    a: _row > 0 && _col > 0 ? matrix[_row - 1][_col - 1] : 0,
                    b: _row > 0 && _col >= 0 ? matrix[_row - 1][_col] : 0,
                    c: _col > 0 && _row >= 0 ? matrix[_row][_col - 1] : 0,
                    d: _col >= 0 && _row >= 0 ? matrix[_row][_col] : 0
                };
            };
            const move = (rowOffset = -1, colOffset = -1) => {
                _row += rowOffset;
                _col += colOffset;
            };
            const record = (type, position, key) => { // de
                const types = {
                    '+': 'insertion',
                    '-': 'deletion',
                    '#': 'replacement',
                    'U': 'unchanged'
                };
                const pos = position - 1;
                if (pos in changes === false) {
                    changes[pos] = {
                        chars: [ key ],
                        type: type in types ? types[type] : 'unknown'
                    };
                } else {
                    changes[pos].chars.splice(0, 0, key);
                }
            };

            while (_row + _col > 0) {
                const { a, b, c, d } = getSiblings();

                if (c < d && _col != 0 && _row != 0) { // d
                    record('-', _col, s[_col - 1]);
                    move(0);
                } else if (b < d) {
                    record('+', _col, t[_row - 1]);
                    move(-1, 0);
                } else if (a < d) {
                    distance += this.distanceBetweenKeys(s[_col - 1], t[_row - 1]) - 1;
                    record('#', _col, t[_row - 1]);
                    move();
                } else {
                    move();
                }
            }

            let sortedChanges = Object.keys(changes).sort((a, b) => b - a);

            const response = {
                distance: distance,
                changes: changes
            };

            if (this.options.comparer.enabled) {
                let diff = str1.split('');

                for (let pos of sortedChanges) {
                    const { chars, type } = changes[pos];
                    const custom = typeof this.options.comparer.tags[type] === 'function';
                    const wrap = (chars) => {
                        return this.options.comparer.tags[type](chars.join(''));
                    };

                    switch (type) {
                        case 'insertion':
                            if(custom) {
                                diff.splice(parseInt(pos) + 1, 0, wrap(chars));
                            }
                            break;
                        case 'deletion':
                        case 'replacement':
                            if (custom) {
                                diff[pos] = wrap(chars);
                            } else {
                                delete diff[pos];
                            }
                            break;
                    }
                }

                response['comparison'] = diff.join('');
            }

            return response;
        }

        getKeyPosition(char) {
            const layout = keyboardLayouts[this.options.layout];
            for (let row in layout) {
                if (layout[row].includes(char)) {
                    return {
                        row: row,
                        col: layout[row].indexOf(char)
                    }
                }
            }

            return false;
        };

        distanceBetweenKeys(char1, char2) {
            const misspells = this.options.misspells;

            if (char1 in misspells && misspells[char1] == char2) return 1;

            const pos1 = this.getKeyPosition(char1);
            const pos2 = this.getKeyPosition(char2);

            if (pos1 === false || pos2 === false) return 1;

            const colDst = Math.abs(pos1.col - pos2.col);
            const rowDst = Math.abs(pos1.row - pos2.row);
            return (colDst == 1 && rowDst == 1) ? 1 : colDst + Math.pow(rowDst, 2);
        };
    }

    return QALDistance;

}));
