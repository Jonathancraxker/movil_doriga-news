export const validarNoticia = (titulo: string, categoria: string, contenido: string) => {
    if (!titulo || !categoria || !contenido) return { valido: false, error: 'Campos vacíos' };
    if (titulo.length < 5) return { valido: false, error: 'Título muy corto' };
    if (contenido.length > 5000) return { valido: false, error: 'Límite de caracteres excedido' };
    return { valido: true, error: null };
};