const fs = require('fs');
const path = require('path')
const os = require('os')

const rutaRoaming = path.join(os.homedir(), 'AppData', 'Roaming');
const rutaCarpetaCTP = path.join(rutaRoaming, '.CTP');
const rutaJsonSettings = path.join(rutaCarpetaCTP, 'config.json')

fs.readFile(rutaJsonSettings, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const config = JSON.parse(data);
    const language = config.settings.lenguaje;

    if (language === 'Espanish') {
        document.getElementById('TexturepackName-text').textContent = 'Nombre del Texturepack:'
        document.getElementById('TexturepackMCVersion-text').textContent = 'Version de Minecraft:'
        document.getElementById('1.18-and-later').textContent = '1.18 (y posterior)'
        document.getElementById('TexturepackVersion-text').textContent = 'Version del Texturepack:'
        document.getElementById('TexturepackDescripcion-text').textContent = 'Descripcion del Texturepack:';
        document.getElementById('descripcion-texturepack').placeholder = 'Un increíble paquete de texturas de Minecraft...'
        document.getElementById('cancel').textContent = 'Cancelar';
        document.getElementById('aceptar').textContent = 'Aceptar'
        document.querySelector('.loading-text').textContent = 'cargando...'
    } else if (language === 'English') {
        document.getElementById('TexturepackName-text').textContent = 'Texturepack Name:'
        document.getElementById('TexturepackMCVersion-text').textContent = 'Minecraft Version:'
        document.getElementById('1.18-and-later').textContent = '1.18 (and later):'
        document.getElementById('TexturepackVersion-text').textContent = 'Texturepack Version:'
        document.getElementById('TexturepackDescripcion-text').textContent = 'Texturepack Description:';
        document.getElementById('descripcion-texturepack').placeholder = 'An amazing minecraft texturepack...'
        document.getElementById('cancel').textContent = 'Cancel';
        document.getElementById('aceptar').textContent = 'Accept'
        document.querySelector('.loading-text').textContent = 'loading...'
    }
});