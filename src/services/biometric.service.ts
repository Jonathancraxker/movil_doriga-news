import { NativeBiometric } from '@capgo/capacitor-native-biometric';

/**
 * Verifica si el teléfono cuenta con hardware biométrico disponible (Huella / Face ID / PIN)
 */
export const checkBiometricAvailability = async (): Promise<boolean> => {
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.error('Error al consultar disponibilidad biométrica:', error);
    return false;
  }
};

/**
 * Lanza la ventana emergente nativa para solicitar la huella dactilar
 */
export const authenticateBiometric = async (
  title: string = 'Confirmación de Autoría',
  reason: string = 'Coloque su huella dactilar en el sensor para continuar'
): Promise<boolean> => {
  try {
    const isAvailable = await checkBiometricAvailability();
    if (!isAvailable) {
      console.warn('El dispositivo no cuenta con biometría activa.');
      return false;
    }

    await NativeBiometric.verifyIdentity({
      title: title,
      subtitle: 'DorigaNews Security',
      description: reason,
      negativeButtonText: 'Cancelar',
    });

    return true; // Autenticación biométrica exitosa
  } catch (error) {
    console.error('Autenticación biométrica cancelada o fallida:', error);
    return false; // Error o usuario presionó cancelar
  }
};