export interface NoticiaInput {
  titulo: string;
  categoria: string;
  contenido: string;
}

// 1. Validación de noticia (Función crítica del móvil)
export const validarNoticia = (data: NoticiaInput): { valido: boolean; error?: string } => {
  if (!data || !data.titulo?.trim() || !data.categoria?.trim() || !data.contenido?.trim()) {
    throw new Error('Todos los campos son obligatorios');
  }
  if (data.titulo.trim().length < 5 || data.titulo.trim().length > 150) {
    return { valido: false, error: 'El título debe tener entre 5 y 150 caracteres' };
  }
  return { valido: true };
};

// 2. Cálculo de paginación (Lógica optimizada en Práctica 12)
export const calcularOffset = (page: number, limit: number): number => {
  if (page < 1 || limit < 1) {
    throw new Error('La página y el límite deben ser mayores a 0');
  }
  return (page - 1) * limit;
};

// 3. Parseo seguro de sesión almacenada (Persistencia)
export const parsearUsuarioLocal = (jsonStr: string | null) => {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};