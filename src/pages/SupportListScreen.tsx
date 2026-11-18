import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonBadge, IonFab, IonFabButton, IonIcon, IonModal,
  IonButton, IonInput, IonTextarea, IonSpinner, useIonViewWillEnter
} from '@ionic/react';
import { addOutline, chatbubbleEllipsesOutline, closeOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const API_URL = 'https://api-doriga.onrender.com/api';

interface Reporte {
  id: number;
  asunto: string;
  estado: 'Pendiente' | 'En proceso' | 'Resuelto';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

const SupportListScreen: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [mensajeInicial, setMensajeInicial] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useIonViewWillEnter(() => {
    cargarReportes();
  });

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const { value: userStr } = await Preferences.get({ key: 'user' });
      const { value: token } = await Preferences.get({ key: 'token' });

      if (userStr && token) {
        const user = JSON.parse(userStr);
        const res = await axios.get(`${API_URL}/soporte/mis-reportes/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportes(res.data);
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearNuevoReporte = async () => {
    if (!asunto.trim() || !mensajeInicial.trim()) return;
    setCreating(true);

    try {
      const { value: userStr } = await Preferences.get({ key: 'user' });
      const { value: token } = await Preferences.get({ key: 'token' });

      if (userStr && token) {
        const user = JSON.parse(userStr);
        const res = await axios.post(
          `${API_URL}/soporte`,
          {
            usuario_id: user.id,
            asunto: asunto.trim(),
            mensaje: mensajeInicial.trim()
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAsunto('');
        setMensajeInicial('');
        setShowModal(false);

        // Redirigir directo al chat recién creado
        navigate(`/soporte/chat/${res.data.reporte_id}`);
      }
    } catch (error) {
      console.error('Error al crear reporte:', error);
    } finally {
      setCreating(false);
    }
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En proceso':
        return 'primary';
      case 'Resuelto':
        return 'success';
      default:
        return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mis Reportes y Soporte</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <IonSpinner name="dots" />
          </div>
        ) : reportes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
            <IonIcon icon={chatbubbleEllipsesOutline} style={{ fontSize: '48px', marginBottom: '12px' }} />
            <h3>No tienes reportes activos</h3>
            <p>Presiona el botón "+" para iniciar una consulta o reportar un problema.</p>
          </div>
        ) : (
          <IonList lines="full">
            {reportes.map((rep) => (
              <IonItem
                key={rep.id}
                button
                detail
                onClick={() => navigate(`/soporte/chat/${rep.id}`)}
              >
                <IonLabel>
                  <p style={{ fontSize: '12px', color: '#888' }}>Ticket #{rep.id}</p>
                  <h2 style={{ fontWeight: 'bold' }}>{rep.asunto}</h2>
                  <p style={{ fontSize: '12px' }}>
                    Actualizado: {new Date(rep.fecha_actualizacion).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </IonLabel>
                <IonBadge slot="end" color={getBadgeColor(rep.estado)}>
                  {rep.estado}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* Botón flotante para crear nuevo reporte */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal para Nuevo Reporte */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nuevo Reporte</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonInput
                label="Asunto o título del problema"
                labelPlacement="stacked"
                placeholder="Ej. Error al cargar noticias de deportes"
                value={asunto}
                onIonInput={(e) => setAsunto(e.detail.value!)}
              />
            </IonItem>

            <IonItem style={{ marginTop: '16px' }}>
              <IonTextarea
                label="Describe tu queja o problema"
                labelPlacement="stacked"
                rows={5}
                placeholder="Detalla qué sucedió para que un administrador pueda ayudarte..."
                value={mensajeInicial}
                onIonInput={(e) => setMensajeInicial(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              expand="block"
              style={{ marginTop: '24px' }}
              onClick={crearNuevoReporte}
              disabled={!asunto.trim() || !mensajeInicial.trim() || creating}
            >
              {creating ? <IonSpinner name="crescent" /> : 'Iniciar Chat de Soporte'}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default SupportListScreen;