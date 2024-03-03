const rutaJsonSettings = path.join(rutaCarpetaCTP, 'config.json')

fs.readFile(rutaJsonSettings, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const config = JSON.parse(data);
    const language = config.settings.lenguaje;

    if (language === 'English') {
        btnBack.textContent = 'Back...'
        btnTop.textContent = 'Back to Top...'
        document.getElementById('renameText').textContent = 'Rename';
        document.getElementById('search').placeholder = 'Search';
        btnCancel.textContent = 'Cancel';
        btnSaveEdit.textContent = 'Save';
    } else if (language === 'Espanish') {
        document.getElementById('search').placeholder = 'Buscar';
        document.getElementById('renameText').textContent = 'Cambiar nombre';
        btnBack.textContent = 'Atras'
        btnTop.textContent = 'Volver al inicio'
        btnCancel.textContent = 'Cancelar';
        btnSaveEdit.textContent = 'Guardar';
    }
});