const output = document.getElementById('output');
const attributeEle = document.querySelector('.attribute');
const valueEle = document.querySelector('.value');
const modalBody = document.querySelector('.modal-body');
// Global variable
var keys = [];
var values = [];
var objs = [];
let excelData = [];
let dataFilter;


function readFile() {
    document.getElementById('upload').addEventListener('change', function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            document.querySelector('.btn-export').style.display = 'block';
            document.querySelector('.btn-filter').style.display = 'block';
            document.querySelector('.prefix').style.display = 'block';
            App();
            objs = toObject(keys, values);
            render(objs);
        };

        reader.readAsArrayBuffer(file);
    });
}

readFile();

function App() {
    let isFirst = true;
    excelData.forEach((row) => {
        if (isFirst) {
            keys = row;
            isFirst = false;
        } else {
            values.push(row);
        }
    });
    document.addEventListener("onblur", e => {
        if (e.target.classList.contains("filter")) {
            console.log(e.target.value);
        }
    });
}
function toObject(keys, values) {
    return values.map(row => {
        let obj = {};
        keys.forEach((k, i) => {
            obj[k] = row[i];
        });
        return obj;
    });
}

function render(objs) {
    if (!objs.length) return;

    const keys = Object.keys(objs[0]);

    attributeEle.innerHTML = keys.map(k => `
        <th scope="col">
            ${k}
            <input type='checkbox' name='${k}'>
        </th>
    `).join('');

    // Render body
    valueEle.innerHTML = objs.map(obj =>
        '<tr>' + keys.map(k => `<td>${obj[k]}</td>`).join('') + '</tr>'
    ).join('');
    for (const [key, value] of Object.entries(objs[0])) {
        let type = 'number';
        if (typeof value === "string") continue;

        modalBody.innerHTML += `
            <input type='${type}' name='${key}' placeholder='${key}' id='${key}'>
        `;
    }

}

function filter() {
    dataFilter = [];
    keys.forEach((key) => {
        const input = document.getElementById(key);
        if (input && input.value !== '') {
            dataFilter.push({
                key: key,
                value: input.value
            })
        }
    });
    modalBody.innerHTML = '';
    App();
    objs = applyFilter(objs, dataFilter)
    render(objs);
}

function applyFilter(objs, dataFilter) {
    return objs.filter(obj =>
        dataFilter.every(f =>
            String(obj[f.key]) == String(f.value)
        )
    );
}

function exportCell() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const checkedColumns = Array.from(checkedBoxes).map(cb => cb.name);


    let exportArr = [];

    objs.forEach(obj => {
        let row = checkedColumns.map(col => obj[col]);
        exportArr.push(row);
    });

    exportToTxt(exportArr);
}
function exportToTxt(array) {
    let prefix = document.querySelector('.prefix').value;
    const text = array.map(row => prefix + row.join("\t")).join("\n");

    // Tạo blob
    const blob = new Blob([text], { type: "text/plain" });

    // Tạo link download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.txt";
    link.click();

    URL.revokeObjectURL(link.href);
}
