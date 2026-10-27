import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonItem,
  IonText,
  IonSpinner,
  useIonRouter,
} from '@ionic/react';
import { fingerPrint } from 'ionicons/icons';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import {
  checkBiometricAvailability,
  authenticateBiometric,
} from '../services/biometric.service';
import './LoginScreen.css';

const API_URL = 'https://api-doriga.onrender.com/api';

const LoginScreen: React.FC = () => {
  const router = useIonRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const init = async () => {
      const available = await checkBiometricAvailability();
      setBiometricAvailable(available);
    };
    init();
  }, []);

  const goHome = () => {
    router.push('/home', 'root', 'replace');
  };

  // Login clásico: correo + PIN
  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !pin.trim()) {
      setError('Ingresa tu correo y PIN.');
      return;
    }

    setLoading(true);
    try {
      // Apuntamos a la ruta exacta de tu backend
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        email: email.trim(),
        pin: pin,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error('Respuesta sin token');
      }

      // Guardamos en Capacitor Preferences (equivalente a localStorage en móvil)
      await Preferences.set({ key: 'token', value: token });
      
      if (user) {
        await Preferences.set({ key: 'user', value: JSON.stringify(user) });
      }

      goHome();
    } catch (err: any) {
      // Replicamos tu lógica de errores de la web
      const backendData = err.response?.data;
      let errorMessage = 'Error al conectar con el servidor';

      if (Array.isArray(backendData) && backendData.length > 0) {
        errorMessage = backendData[0];
      } else if (backendData?.message) {
        errorMessage = backendData.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login con huella: verifica que exista un token previo
  const handleBiometricLogin = async () => {
    setError('');

    const ok = await authenticateBiometric(
      'Iniciar sesión',
      'Usa tu huella para entrar'
    );

    if (!ok) {
      setError('No se pudo verificar tu huella.');
      return;
    }

    // Buscamos el token con Preferences
    const { value: token } = await Preferences.get({ key: 'token' });
    if (!token) {
      setError(
        'Primero inicia sesión con tu PIN para activar la biometría.'
      );
      return;
    }

    goHome();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <h1 className="login-title">DorigaNews</h1>
          <p className="login-subtitle">Inicia sesión para continuar</p>

          <IonItem className="login-input" lines="none">
            <IonInput
              type="email"
              label="Correo"
              labelPlacement="floating"
              value={email}
              autocomplete="email"
              onIonInput={(e) => setEmail(e.detail.value ?? '')}
            />
          </IonItem>

          <IonItem className="login-input" lines="none">
            <IonInput
              type="number"
              label="PIN"
              labelPlacement="floating"
              value={pin}
              autocomplete="current-password"
              onIonInput={(e) => setPin(e.detail.value ?? '')}
            />
          </IonItem>

          {error && (
            <IonText color="danger">
              <p className="login-error">{error}</p>
            </IonText>
          )}

          <IonButton
            expand="block"
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <IonSpinner name="dots" /> : 'Entrar'}
          </IonButton>

          {biometricAvailable && (
            <IonButton
              expand="block"
              fill="outline"
              className="login-button"
              onClick={handleBiometricLogin}
              disabled={loading}
            >
              <IonIcon slot="start" icon={fingerPrint} />
              Entrar con huella
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;