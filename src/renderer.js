const { ipcRenderer, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');


const rutaRoaming = path.join(require('os').homedir(), 'AppData', 'Roaming');
const rutaCarpetaCTP = path.join(rutaRoaming, '.CTP');
const rutaCarpetaProjects = path.join(rutaCarpetaCTP, 'projects');

const container = document.getElementById('container');
const btnBack = document.getElementById('backButton');
const btnTop = document.getElementById('inicioButton');

let currentFilePath = ''; // Variable global para almacenar la ruta del archivo actualmente abierto
let folderHistory = [];


// Función para leer y mostrar los archivos y carpetas en el contenedor
function readFolders(dirPath) {
  btnBack.classList.toggle('invisible', folderHistory.length === 0);
  btnTop.classList.toggle('invisible', folderHistory.length === 0);
  folderHistory.push(dirPath);

  fs.readdir(dirPath, (err, items) => {
    if (err) {
      console.error('Error al leer la carpeta:', err);
      return;
    }

    container.innerHTML = '';

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      const iconContenedor = document.createElement('div');
      iconContenedor.classList.add('containerIcon');
      const contentName = document.createElement('div');
      contentName.classList.add('conten-name');

      if (stats.isFile()) {
        const containerElement = document.createElement('div');
        containerElement.classList.add('containerElement', 'articulo');
        containerElement.dataset.fileName = item;

        if (path.extname(item).toLowerCase() === '.png') {
          const imgElement = document.createElement('img');
          imgElement.src = itemPath;
          iconContenedor.appendChild(imgElement);
          // Event listener para abrir Paint.NET al hacer doble clic en un archivo .png
          containerElement.addEventListener('dblclick', (e) => {
            imagePath = e.target.getAttribute('src');
            openWithPaintDotNet(imagePath);
          });}else {
            const iconElement = document.createElement('i');
            iconElement.classList.add('fas', 'fa-file-alt');
            iconContenedor.appendChild(iconElement);
          }

            containerElement.appendChild(iconContenedor);
            const fileElement = document.createElement('p');
            fileElement.textContent = item;
            contentName.appendChild(fileElement);
            containerElement.appendChild(contentName);
            if(folderHistory.length  > 1){
              projectOptions.classList.add('invisible')
            }
            container.appendChild(containerElement);
            if(folderHistory.length  > 1){
              projectOptions.classList.add('invisible')
            }
            containerElement.addEventListener('dblclick', () => {
              
              const fileName = containerElement.querySelector('p').textContent;
              const filePath = path.join(dirPath, fileName);
              if (fileName.includes('.mcmeta') || fileName.includes('.txt') || fileName.includes('.json') || fileName.includes('.lang') ) {
                  openEditText();
                  document.querySelector('.fileName').textContent = fileName;
                  ipcRenderer.send('open-file-in-editor', { filePath, fileName });
              }
            });
        } else if (stats.isDirectory()) {
            
          const folderElement = document.createElement('div');
          folderElement.classList.add('folder-item', 'articulo');

          const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-folder');

            const name = document.createElement('p');
            name.textContent = item;

            iconContenedor.appendChild(icon);
            folderElement.appendChild(iconContenedor);
            contentName.appendChild(name);
            folderElement.appendChild(contentName);

            folderElement.addEventListener('dblclick', () => {
                const folderPath = path.join(dirPath, item);
                readFolders(folderPath);
            });
            const projectOptions = document.getElementById('projectOptions');

            container.appendChild(folderElement);
            
            if(folderHistory.length == 1){
              if(folderHistory.length  != 1){
                projectOptions.classList.add('invisible')
              }
                folderElement.addEventListener('click', e=>{
                  rutaArchivo = folderHistory +`\\${item}`;
                  if(folderHistory.length  != 1){
                    projectOptions.classList.add('invisible')
                  }
                    const asideTextName = projectOptions.querySelector('h2');
                    asideTextName.textContent = item;
                    projectOptions.classList.toggle('invisible')
                    const btnRename = document.getElementById('renameButton');
                    document.getElementById('exportButton').addEventListener('click', e=>{
                      console.log(rutaArchivo)
                      PathProject = rutaArchivo;
                      nameProject = item 
                      ipcRenderer.send('export:project', PathProject, nameProject)
                    })
                    btnRename.addEventListener('click', e=>{
                      document.querySelector('.contenRenameOptions').style.display = 'block';
                    })
                    
                    document.getElementById('btn-rename').addEventListener('click', e=>{
                      const newNameProyect = document.querySelector('#inputRename').value;
                      if(newNameProyect == ''){return;}
                      newRuta = folderHistory +`\\${newNameProyect}`;
                      fs.renameSync(rutaArchivo, newRuta);
                      window.location.reload()
                    })                     
                })
            }
        }
    });
});
}
function openWithPaintDotNet(imagePath) {
  const paintDotNetPath = 'C:/Program Files/paint.net/PaintDotNet.exe';
  // Verificar si el archivo de Paint.NET existe
  if (!fs.existsSync(paintDotNetPath)) {
    console.error('El archivo PaintDotNet.exe no fue encontrado en la ruta especificada.');
    return;
  }
  // Crear un proceso hijo para ejecutar Paint.NET con la ruta del archivo como argumento
  const childProcess = spawn(paintDotNetPath, [imagePath]);
  // Manejar eventos de salida del proceso hijo
  childProcess.on('error', (error) => {
    console.error('Error al intentar abrir Paint.NET:', error);
  });
  childProcess.on('exit', (code, signal) => {
    console.log(`Paint.NET se cerró con el código de salida ${code} y la señal ${signal}.`);
  });
}
// Event listener para cargar la carpeta de proyectos al inicio
window.addEventListener('DOMContentLoaded', () => {
  readFolders(rutaCarpetaProjects);
});

// Event listener para el botón de retroceder
btnBack.addEventListener('click', () => {
  if (folderHistory.length > 1) {
    folderHistory.pop();
    readFolders(folderHistory.pop());
  }
});

btnTop.addEventListener('click', e =>{
  window.location.reload()
})

// Event listener para el botón de agregar
document.querySelector('.btn-add').addEventListener('click', () => {
  ipcRenderer.send('open:createTexturepack');
});

// Event listener para el botón de guardar
const btnSaveEdit = document.getElementById('saveButton');
btnSaveEdit.addEventListener('click', () => {
  const editorTextarea = document.getElementById('editor-textarea');
  const content = editorTextarea.value;
  const filePath = editorTextarea.dataset.filePath;
  openEditText();
  ipcRenderer.send('save-text-file', { filePath, content });
});

// Función para mostrar el editor de texto
function openEditText() {
  document.querySelector('main').classList.toggle('invisible');
  document.getElementById('editor-texto').classList.toggle('invisible');
  btnBack.classList.toggle('invisible');
}

const btnCancel = document.getElementById('cancelButton');
// Event listener para el botón de cancelar
btnCancel.addEventListener('click', openEditText);

// Event listener para mostrar el contenido del archivo recibido
ipcRenderer.on('file-content', (event, { filePath, fileName, fileContent }) => {
  const editorTextarea = document.getElementById('editor-textarea');
  if (editorTextarea) {
    editorTextarea.value = fileContent;
    editorTextarea.dataset.filePath = filePath;
  }
});

// Event listener para manejar errores al leer el contenido del archivo
ipcRenderer.on('file-content-error', (event, errorMessage) => {
  console.error('Error al leer el archivo:', errorMessage);
  // Manejar el error de lectura del archivo (puedes mostrar un mensaje de error en la interfaz)
});

// Event listener para abrir archivos ZIP
ipcRenderer.on('open-zip-file', (event, zipFiles) => {
  const rutaCarpetaProjects = path.join(__dirname, 'projects');
  zipFiles.forEach(zipFile => {
    const filePath = path.join(rutaCarpetaProjects, zipFile);
    shell.openPath(filePath);
  });
});

// Event listener para cambiar de carpeta
ipcRenderer.on('folder-changed', (event, folderName) => {
  currentFolderName = folderName;
  readFolders(path.join(rutaCarpetaProjects, folderName));
});
document.querySelector('.btn-patreon').addEventListener('click', e=>{
  shell.openExternal('https://www.patreon.com/user?u=118872538');
})
document.getElementById('btn-settings').addEventListener('click', e=>{
  ipcRenderer.send('open:settings')
})

document.getElementById('btn-rename-cancel').addEventListener('click', e=>{
  document.querySelector('.contenRenameOptions').style.display = 'none';
});

