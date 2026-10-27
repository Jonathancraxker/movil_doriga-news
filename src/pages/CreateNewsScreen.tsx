import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  useIonRouter,
  IonSpinner,
  IonAlert // <--- Agregamos IonAlert
} from '@ionic/react';
import { cameraOutline, folderOpenOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { authenticateBiometric } from '../services/biometric.service';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import './CreateNewsScreen.css';

const API_URL = 'https://api-doriga.onrender.com/api';

const CreateNewsScreen: React.FC = () => {
  const router = useIonRouter();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showPinAlert, setShowPinAlert] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { value } = await Preferences.get({ key: 'user' });
      if (value) {
        setUserData(JSON.parse(value));
      }
    };
    loadUser();
  }, []);

  const tomarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 70, // Reducimos un poco la calidad para que no pese tanto el base64
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      if (image.dataUrl) setImagenUrl(image.dataUrl);
    } catch (e) {
      console.log("Cámara cancelada", e);
    }
  };

  const seleccionarArchivo = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      if (image.dataUrl) setImagenUrl(image.dataUrl);
    } catch (e) {
      console.log("Galería cancelada", e);
    }
  };

  // 1. Inicia la solicitud
  const iniciarPublicacion = () => {
    setError('');
    if (!titulo || !categoria || !contenido) {
      setError('Por favor, llena todos los campos de texto obligatorios.');
      return;
    }
    // Disparamos la biometría nativa inmediatamente
    confirmarFirma();
  };

  // 2. Invoca el sensor del teléfono
  const confirmarFirma = async () => {
    const success = await authenticateBiometric('Firma de Autoría', 'Verifica tu identidad para publicar la noticia');
    
    if (success) {
      // Si la huella fue exitosa, publicamos directo
      publicarNoticia();
    } else {
      // Si falló o el usuario canceló, le pedimos su PIN de respaldo
      setShowPinAlert(true);
    }
  };

  // 3. Verifica el PIN consumiendo tu propio login
  const verificarPinRespaldo = async (pinIngresado: string) => {
    if (!pinIngresado) return;
    
    setLoading(true);
    try {
      // Usamos el endpoint de login para comprobar que el PIN pertenece a su correo
      await axios.post(`${API_URL}/usuarios/login`, {
        email: userData?.email,
        pin: pinIngresado
      });

      // Si no da error, el PIN es correcto
      publicarNoticia();
    } catch (err) {
      setError('Firma rechazada: El PIN ingresado es incorrecto.');
      setLoading(false);
    }
  };

  // 4. Publica la noticia en la base de datos
  const publicarNoticia = async () => {
    setLoading(true);
    try {
      const { value: token } = await Preferences.get({ key: 'token' });
      
      await axios.post(`${API_URL}/noticias/crear`, {
        titulo,
        contenido,
        categoria,
        imagen: imagenUrl,
        autor_id: userData?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.goBack();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al subir la noticia al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" className="back-btn" />
          </IonButtons>
          <IonTitle className="create-title">Nueva Noticia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="create-content">
        <div className="form-container">
          
          <IonLabel className="form-label">Título de la Noticia</IonLabel>
          <IonItem className="custom-input" lines="none">
            <IonInput 
              placeholder="Escribe un título claro y verificable" 
              value={titulo} 
              onIonInput={(e) => setTitulo(e.detail.value!)} 
            />
          </IonItem>

          <IonLabel className="form-label">Categoría</IonLabel>
          <IonItem className="custom-input" lines="none">
            <IonSelect 
              placeholder="Selecciona una categoría" 
              value={categoria} 
              onIonChange={(e) => setCategoria(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="Política">Política</IonSelectOption>
              <IonSelectOption value="Tecnología">Tecnología</IonSelectOption>
              <IonSelectOption value="Economía">Economía</IonSelectOption>
              <IonSelectOption value="Deportes">Deportes</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonLabel className="form-label">Contenido</IonLabel>
          <IonItem className="custom-textarea" lines="none">
            <IonTextarea 
              placeholder="Escribe el cuerpo de la noticia..." 
              value={contenido} 
              onIonInput={(e) => setContenido(e.detail.value!)} 
              rows={6}
            />
          </IonItem>

          <div className="multimedia-header">
            <IonLabel className="form-label" style={{marginBottom: 0}}>Multimedia</IonLabel>
            <span className="file-formats">.jpg .png .mp4</span>
          </div>

          <div className="multimedia-buttons">
            <div className="media-btn" onClick={tomarFoto}>
              <IonIcon icon={cameraOutline} className="media-icon text-primary" />
              <span>Tomar Foto / Grabar Video</span>
            </div>
            <div className="media-btn" onClick={seleccionarArchivo}>
              <IonIcon icon={folderOpenOutline} className="media-icon text-primary" />
              <span>Seleccionar Archivo</span>
            </div>
          </div>

          <div className="preview-container">
            {imagenUrl ? (
              <img src={imagenUrl} alt="Previa" style={{width: '100%', borderRadius: '8px', objectFit: 'cover', height: '120px'}} />
            ) : (
              <span className="preview-text">Vista previa<br/>Foto capturada o video .mp4</span>
            )}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <IonButton expand="block" className="publish-btn" onClick={iniciarPublicacion} disabled={loading}>
            {loading ? <IonSpinner name="dots"/> : 'Publicar Noticia'}
          </IonButton>

        </div>

        {/* ALERTA NATIVA PARA PEDIR EL PIN */}
        <IonAlert
          isOpen={showPinAlert}
          onDidDismiss={() => setShowPinAlert(false)}
          header="Firma Biométrica Cancelada"
          message="Ingresa tu PIN de seguridad de DorigaNews para autorizar la publicación."
          inputs={[
            {
              name: 'pin',
              type: 'password',
              placeholder: 'Ingresa tu PIN'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setError('Publicación cancelada. No se pudo verificar la identidad.');
              }
            },
            {
              text: 'Autorizar',
              handler: (alertData) => {
                verificarPinRespaldo(alertData.pin);
              }
            }
          ]}
        />

      </IonContent>
    </IonPage>
  );
};

export default CreateNewsScreen;