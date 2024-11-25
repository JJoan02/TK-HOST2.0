export async function generarCodigoVinculacion(usuario) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigoVinculacion = '';

    for (let i = 0; i < 3; i++) {
        codigoVinculacion += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    codigoVinculacion += '-';
    for (let i = 0; i < 3; i++) {
        codigoVinculacion += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    let db = await openDb();

    // Guardar el código de vinculación en la base de datos
    await db.run(
        `INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)`,
        [codigoVinculacion, usuario, new Date().toISOString(), new Date(Date.now() + 5 * 60 * 1000).toISOString()]
    );

    return codigoVinculacion;
}
