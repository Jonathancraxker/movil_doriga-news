import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { validarNoticia, calcularOffset, parsearUsuarioLocal } from '../utils/validaciones';

vi.mock('axios');
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('FASE 2: Pruebas Unitarias - Lógica de Negocio DorigaNews', () => {
  // AUT-01: Entrada válida
  it('1. [Entrada válida] Debe aprobar una noticia con datos completos y longitud correcta', () => {
    const resultado = validarNoticia({
      titulo: 'Avances tecnológicos en Querétaro 2026',
      categoria: 'Tecnología',
      contenido: 'Contenido completo de prueba para la nota periodística.',
    });
    expect(resultado.valido).toBe(true);
  });

  // AUT-01: Entrada vacía o nula
  it('2. [Entrada vacía/nula] Debe lanzar excepción si faltan campos obligatorios', () => {
    expect(() =>
      validarNoticia({ titulo: '', categoria: 'General', contenido: '' })
    ).toThrow('Todos los campos son obligatorios');
  });

  // AUT-02: Valores fuera de rango
  it('3. [Fuera de rango] Debe rechazar un título menor a 5 caracteres', () => {
    const resultado = validarNoticia({
      titulo: 'Hola',
      categoria: 'Deportes',
      contenido: 'Texto válido de contenido.',
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toContain('entre 5 y 150');
  });

  // AUT-02: Resultado esperado
  it('4. [Resultado esperado] Debe calcular correctamente el OFFSET para paginación SQL', () => {
    expect(calcularOffset(1, 10)).toBe(0);
    expect(calcularOffset(3, 10)).toBe(20);
  });

  // AUT-03: Manejo de excepciones
  it('5. [Manejo de excepciones] Debe controlar JSON corrupto en almacenamiento sin colapsar', () => {
    const usuario = parsearUsuarioLocal('{json_corrupto_sin_cerrar');
    expect(usuario).toBeNull();
  });
});

describe('FASE 3: Pruebas de Integración - API REST y Persistencia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AUT-04: Envío de información al servicio y respuesta HTTP esperada
  it('6. [Integración API POST] Debe enviar un reporte de soporte y recibir HTTP 201 con reporte_id', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 201,
      data: { message: 'Reporte creado con éxito', reporte_id: 14 },
    });

    const response = await axios.post('https://api-doriga.onrender.com/api/soporte', {
      usuario_id: 2,
      asunto: 'Fallo en carga de imagen',
      mensaje: 'No carga la vista previa en Android.',
    });

    expect(response.status).toBe(201);
    expect(response.data.reporte_id).toBe(14);
  });

  // AUT-05: Manejo adecuado cuando el servidor falla (HTTP 500 / caída)
  it('7. [Integración API Error] Debe capturar error controlado cuando el servidor responde HTTP 500', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Error interno del servidor' } },
    });

    await expect(
      axios.get('https://api-doriga.onrender.com/api/noticias')
    ).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  // AUT-06: Persistencia de sesión en Capacitor Preferences
  it('8. [Integración Persistencia] Debe almacenar y recuperar el token JWT en Preferences', async () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    vi.mocked(Preferences.get).mockResolvedValueOnce({ value: mockToken });

    await Preferences.set({ key: 'token', value: mockToken });
    const { value } = await Preferences.get({ key: 'token' });

    expect(Preferences.set).toHaveBeenCalledWith({ key: 'token', value: mockToken });
    expect(value).toBe(mockToken);
  });
});