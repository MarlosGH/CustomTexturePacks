fs.readFile(rutaJsonSettings, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const config = JSON.parse(data);
    const language = config.settings.lenguaje;

    if (language === 'English') {
        document.getElementById('cancelSettings').textContent = 'Cancel';
        document.getElementById('saveSettings').textContent = 'Save';

    } else if (language === 'Espanish') {
        document.getElementById('cancelSettings').textContent = 'Cancelar'
        document.getElementById('saveSettings').textContent = 'Guardar'

    }
});