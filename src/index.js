const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const os = require('os');
const JSZip = require('jszip');
const { error } = require('console');

app.allowRendererProcessReuse = true;

let mainWindow;
let newProductWindow;
let configWindow;

const rutaRoaming = path.join(os.homedir(), 'AppData', 'Roaming');
const rutaCarpetaCTP = path.join(rutaRoaming, '.CTP');
const rutaCarpetaProjects = path.join(rutaCarpetaCTP, 'projects');
const rutaJsonSettings = path.join(rutaCarpetaCTP, 'config.json')

function checkPaintDotNetInstallation() {
    // Rutas comunes donde Paint.NET puede estar instalado
    const programFilesPath = process.env['ProgramFiles'] || process.env.ProgramFiles; // Ruta a Program Files en sistemas de 64 bits o 32 bits
    const paintDotNetPaths = [
        path.join(programFilesPath, 'paint.net', 'PaintDotNet.exe'),
        path.join(programFilesPath, 'paint.net', 'PaintDotNet.x64.exe') // Posible ubicación en sistemas de 64 bits
    ];

    // Verifica si alguno de los archivos existe
    const isInstalled = paintDotNetPaths.some(filePath => {
        try {
            fs.accessSync(filePath, fs.constants.F_OK);
            return true;
        } catch (err) {
            return false;
        }
    });

    return isInstalled;
}

let jsonConfigTemplate = `{
"settings": 
{
    "lenguaje": "English"
}}`;



if (!fs.existsSync(rutaCarpetaCTP)) {
    try {
        fs.mkdirSync(rutaCarpetaCTP);
        fs.mkdirSync(rutaCarpetaProjects);
        fs.writeFile(rutaJsonSettings, jsonConfigTemplate, (error)=>{
            if (error) {
                console.log(error)
            }
        })
        console.log('Carpeta .CTP creada correctamente.');
    } catch (error) {
        console.error('Error al crear la carpeta .CTP:', error);
    }
}
if (!fs.existsSync(rutaCarpetaProjects)) {
    try {
        fs.mkdirSync(rutaCarpetaProjects);
        console.log('Carpeta Projects fue creada creada correctamente.');
    } catch (error) {
        console.error('Error al crear la carpeta Projects:', error);
    }
}

if (!fs.existsSync(rutaJsonSettings)) {
    try {
        fs.writeFile(rutaJsonSettings, jsonConfigTemplate, (error)=>{
            if (error) {
                console.log(error)
            }
        })
        console.log('El archivo json fue creado correctamente.');
    } catch (error) {
        console.error('Error al crear la carpeta Projects:', error);
    }
}




function createZipFromFolder(folderPath, zipFilePath) {
    const zip = new JSZip();

    // Recorre la carpeta y agrega archivos al zip
    function addFolderToZip(folderPath, zipFolder) {
        const files = fs.readdirSync(folderPath);

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Si es una carpeta, crea una subcarpeta en el zip
                const subZipFolder = zipFolder.folder(file);
                addFolderToZip(filePath, subZipFolder);
            } else {
                // Si es un archivo, agrega el archivo al zip
                const fileData = fs.readFileSync(filePath);
                zipFolder.file(file, fileData);
            }
        });
    }

    addFolderToZip(folderPath, zip);

    // Genera el archivo zip
    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(zipFilePath))
        .on('finish', function () {
            console.log('Carpeta exportada a zip correctamente.');
        });
}

let emergenteWindow;

// function paintNetNotInstalled(){
// }
function CreateEmergenteWindow() {
    // Crear la ventana de emergenteWindow después de mostrar la ventana de carga
    if (!emergenteWindow) {
        emergenteWindow = new BrowserWindow({
            width: 500,
            height: 300,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });

        emergenteWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/emergente.html'),
            protocol: 'file',
            slashes: true,
        }));
        
        emergenteWindow.on('closed', () => {
            emergenteWindow = null;
        });

    } else {
        emergenteWindow.focus();
    }
}

app.on('ready', () => {
    
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        icon: path.join(__dirname+'/imgs/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        app.quit();
    });
    app.setAppUserModelId(process.execPath);
    app.setAsDefaultProtocolClient('myapp');
    mainWindow.webContents.on('did-finish-load', () => {
        fs.readdir(rutaCarpetaProjects, (err, files) => {
            if (err) {
                console.error('Error al leer la carpeta:', err);
                return;
            }
            const zipFiles = files.filter(file => path.extname(file) === '.zip');
            mainWindow.webContents.send('zip-files', zipFiles);
        });
    });
    if (checkPaintDotNetInstallation()) {
        console.log('Paint net instalado')
    } else {
        CreateEmergenteWindow();
        console.log('Paint.NET no está instalado en el sistema.');
    }
});

ipcMain.on('open-zip-file', (event, zipFiles) => {
    const rutaCarpetaProjects = path.join(__dirname, 'projects');
    zipFiles.forEach(zipFile => {
        const filePath = path.join(rutaCarpetaProjects, zipFile);
        shell.openPath(filePath);
    });
});



// Dentro de la función createProductWindow():
function createProductWindow() {
    // Crear la ventana de newProductWindow después de mostrar la ventana de carga
    if (!newProductWindow) {
        newProductWindow = new BrowserWindow({
            width: 660,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });

        newProductWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/product.html'),
            protocol: 'file',
            slashes: true,
        }));

        newProductWindow.on('closed', () => {
            newProductWindow = null;
        });
    } else {
        newProductWindow.focus();
    }
}

ipcMain.on('closed:product', webContentsId => {
    newProductWindow.close();
});
ipcMain.on('closed:settings', webContentsId => {
    configWindow.close();
});

// Guardar texturepack
ipcMain.on('save:texturepack', async (event, infoTexturepack) => {
    try {
        // Obtener la versión de Minecraft seleccionada
        const packFormat = infoTexturepack.pack_format;

        // Definir la ruta de la carpeta de la versión seleccionada
        const rutaVersion = path.join(__dirname, 'mc-versions', `${packFormat}`);

        // Comprobar si la carpeta de la versión existe
        if (!fs.existsSync(rutaVersion)) {
            dialog.showErrorBox('Error', 'No se encontró la versión de Minecraft seleccionada.');
            return;
        }
        
        // Definir la ruta de la carpeta para el nuevo texturepack
        const rutaTexturepack = path.join(rutaCarpetaCTP, 'projects', `${infoTexturepack.name}`);
        
        // Crear la carpeta para el nuevo texturepack
        await fs.mkdirSync(rutaTexturepack);

        const rutaAssetsDestino = path.join(rutaTexturepack, 'assets');
        await fs.mkdirSync(rutaAssetsDestino);
        
        // Copiar la carpeta 'assets' de la versión seleccionada al nuevo texturepack
        await fs.copySync(path.join(rutaVersion, 'assets'), rutaAssetsDestino);

        // Crear el archivo 'pack.mcmeta' con la información del texturepack
        const contenidoPackMcMeta = `{
    "pack": {
        "pack_format": "${infoTexturepack.pack_format}",
        "description": "${infoTexturepack.description}"
    },
    "description": {
        "name": "${infoTexturepack.name}",
        "version": "${infoTexturepack.version}",
        "description": "${infoTexturepack.description}",
        "author": "${infoTexturepack.author}",
        "format": "PACK_FORMAT_${infoTexturepack.pack_format}"
    }
}`;

        await fs.writeFileSync(path.join(rutaTexturepack, 'pack.mcmeta'), contenidoPackMcMeta);
        newProductWindow.close();
        console.log('Texturepack creado correctamente.');
        mainWindow.reload();
    } catch (error) {
        console.error('Error al guardar el texturepack:', error);
    }
});



ipcMain.on('open:createTexturepack', e => {
    createProductWindow();
});

fs.readdir(rutaCarpetaProjects, (err, files) => {
    if (err) {
        console.error('Error al leer la carpeta:', err);
        return;
    }
});

let mainMenuTemplate = [
    {
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    }
];

if (process.env.NODE_ENV !== 'production') {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

ipcMain.on('open-file-in-editor', (event, { filePath, fileName }) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            event.sender.send('file-content-error', err.message);
        } else {
            event.sender.send('file-content', { filePath, fileName, fileContent: data }); // Enviar la ruta del archivo junto con el contenido
        }
    });
});


ipcMain.on('save-text-file', (event, { filePath, content }) => {
    fs.writeFile(filePath, content, 'utf-8', err => {
        if (err) {
            console.error('Error al guardar el archivo:', err);
        } else {
            console.log('Archivo guardado correctamente.');
        }
    });
});

function browserConfigWindow(){
    if(!configWindow){
        configWindow = new BrowserWindow({width: 400, height: 600, webPreferences:{nodeIntegration:true,contextIsolation:false}})
        configWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/settings.html'),
            protocol: 'file',
            slashes: true,
        }));
        configWindow.on('closed', () => {
            configWindow = null;
        });
    }else{
        configWindow.focus();
    }
}

ipcMain.on('open:settings', e=>{
    browserConfigWindow();
})

ipcMain.on('save:settings', (event , newJsonConfigobject) =>{
    const newjsonConfigTemplate = `{
        "settings": 
          {
            "lenguaje": "${newJsonConfigobject.lenguaje}"
          }
      }`
    fs.writeFile(rutaJsonSettings, newjsonConfigTemplate)
    mainWindow.reload();
    configWindow.close()
});

function showSaveProjectDialog(PathProject, nameProject) {
    const window = BrowserWindow.getFocusedWindow();
    dialog.showSaveDialog(window, {
        title: 'Guardar proyecto',
        defaultPath: app.getPath('documents') + `/${nameProject}.zip`, // Ruta predeterminada
        buttonLabel: 'Guardar', // Etiqueta del botón de guardar
        filters: [{ name: 'All Files', extensions: ['*'] }] // Filtros de tipo de archivo
    }).then(result => {
        if (!result.canceled) {
            const selectedPath = result.filePath;
            console.log(PathProject)
            createZipFromFolder(PathProject, selectedPath);
            if(error){
                console.log("ha ocurrido un error: "+error)
            }
        }
    }).catch(err => {
        console.error('Error al mostrar el diálogo de guardar:', err);
    });
}

ipcMain.on('export:project', (e, PathProject, nameProject)=>{
    showSaveProjectDialog(PathProject, nameProject);
    
})