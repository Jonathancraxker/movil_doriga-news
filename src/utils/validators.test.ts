import { test, expect, describe } from 'vitest';
import { validarNoticia } from './validators';

describe('Pruebas Unitarias - Validación de Noticias', () => {
    test('Debe aceptar una noticia con datos correctos', () => {
        const resultado = validarNoticia('Nueva tecnología en México', 'Tecnología', 'El contenido de la noticia...');
        expect(resultado.valido).toBe(true);
    });

    test('Debe aceptar un título en el límite mínimo de 5 caracteres', () => {
        const resultado = validarNoticia('12345', 'Economía', 'Contenido válido');
        expect(resultado.valido).toBe(true);
    });

    test('Debe rechazar la noticia si falta la categoría', () => {
        const resultado = validarNoticia('Título válido', '', 'Contenido válido');
        expect(resultado.valido).toBe(false);
        expect(resultado.error).toBe('Campos vacíos');
    });
});