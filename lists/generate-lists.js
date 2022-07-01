const fs = require('fs');
const path = require('path');

function generateList(name) {
    const p = path.join('.', name + '.txt');
    const lines = fs.readFileSync(p, 'utf-8')
        .split(/\r?\n/)
        .filter(x => !!x);
    let date = new Date(Date.parse('2022-06-25T00:00:00Z'));
    const files = {};
    const mapped = lines.map((line, index) => {
        const d = {
            files: ['' + date.getFullYear() + '' + (date.getMonth() + 1).toString().padStart(2, '0')],
            date,
            line,
            index
        };
        if (date.getDate() > 26) {
            const nextDate = new Date(date.valueOf());
            nextDate.setDate(nextDate.getDate() + 5);
            d.files.push('' + nextDate.getFullYear() + '' + (nextDate.getMonth() + 1).toString().padStart(2, '0'));
        }
        const newDate = new Date(date.valueOf());
        newDate.setDate(newDate.getDate() + 1);
        date = newDate;
        return d;
    });
    mapped.forEach(m => {
        m.files.forEach(f => {
            if (!files[f]) files[f] = [];
            files[f].push({
                name: m.line,
                index: m.index,
                date: '' + m.date.getFullYear() + (m.date.getMonth() + 1).toString().padStart(2, '0') + m.date.getDate().toString().padStart(2, '0')
            });
        });
    });
    const outputDir = path.join('..', 'public', 'lists', name);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    for (const key in files) {
        const fname = path.join(outputDir, key + '.js');
        fs.writeFileSync(fname, JSON.stringify(files[key]), 'utf-8');
    }
}

const listsDir = path.join('..', 'public', 'lists');
if (!fs.existsSync(listsDir)) fs.mkdirSync(listsDir);

generateList('standard');
generateList('gaming');
