import React, { useState, useRef } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonFooter, IonItem, IonInput,
  IonButton, IonIcon, IonSpinner, IonBadge, useIonViewWillEnter
} from '@ionic/react';
import { sendOutline, refreshOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import './SupportChatScreen.css';

const API_URL = 'https://api-doriga.onrender.com/api';

interface Mensaje {
  id: number;
  reporte_id: number;
  remitente: 'usuario' | 'admin';
  mensaje: string;
  fecha_envio: string;
}

interface ReporteInfo {
  id: number;
  asunto: string;
  estado: 'Pendiente' | 'En proceso' | 'Resuelto';
}

const SupportChatScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID del ticket seleccionado
  const [reporteInfo, setReporteInfo] = useState<ReporteInfo | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const contentRef = useRef<HTMLIonContentElement | null>(null);

  useIonViewWillEnter(() => {
    cargarConversacion();
  });

  const cargarConversacion = async () => {
    setLoading(true);
    try {
      const { value: token } = await Preferences.get({ key: 'token' });
      if (token && id) {
        const response = await axios.get(`${API_URL}/soporte/${id}/mensajes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReporteInfo(response.data.reporte);
        setMensajes(response.data.mensajes);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error al cargar la conversación:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !id || reporteInfo?.estado === 'Resuelto') return;

    setSending(true);
    try {
      const { value: token } = await Preferences.get({ key: 'token' });

      await axios.post(
        `${API_URL}/soporte/${id}/mensajes`,
        {
          remitente: 'usuario',
          mensaje: nuevoMensaje.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNuevoMensaje('');
      await cargarConversacion();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      contentRef.current?.scrollToBottom(300);
    }, 100);
  };

  const isResuelto = reporteInfo?.estado === 'Resuelto';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="chat-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/soporte" className="back-btn" />
          </IonButtons>
          <IonTitle className="chat-title">
            {reporteInfo ? `#${reporteInfo.id} - ${reporteInfo.asunto}` : 'Cargando...'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={cargarConversacion}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Barra de estado del ticket */}
        {reporteInfo && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 16px',
            backgroundColor: '#f4f5f8',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '13px'
          }}>
            <span>Estado del reporte:</span>
            <IonBadge color={
              reporteInfo.estado === 'Resuelto' ? 'success' :
              reporteInfo.estado === 'En proceso' ? 'primary' : 'warning'
            }>
              {reporteInfo.estado}
            </IonBadge>
          </div>
        )}
      </IonHeader>

      <IonContent className="chat-content" ref={contentRef}>
        {loading ? (
          <div className="loading-container"><IonSpinner name="dots" /></div>
        ) : (
          <div className="messages-container">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.remitente === 'usuario' ? 'user-message' : 'admin-message'}`}
              >
                <div className="message-bubble">
                  <span className={msg.remitente === 'usuario' ? 'report-badge' : 'admin-badge'}>
                    {msg.remitente === 'usuario' ? 'Tú' : 'Soporte DorigaNews'}
                  </span>
                  <p>{msg.mensaje}</p>
                  <span className="message-time">
                    {new Date(msg.fecha_envio).toLocaleTimeString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>

      <IonFooter className="chat-footer ion-no-border">
        {isResuelto ? (
          <div style={{
            padding: '14px',
            textAlign: 'center',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '20px' }} />
            <span>Este caso fue marcado como resuelto.</span>
          </div>
        ) : (
          <div className="input-container">
            <IonItem lines="none" className="chat-input-item">
              <IonInput
                placeholder="Escribe tu mensaje..."
                value={nuevoMensaje}
                onIonInput={(e) => setNuevoMensaje(e.detail.value!)}
                onKeyUp={(e) => e.key === 'Enter' && enviarMensaje()}
              />
            </IonItem>
            <IonButton
              className="send-btn"
              fill="clear"
              onClick={enviarMensaje}
              disabled={!nuevoMensaje.trim() || sending}
            >
              {sending ? <IonSpinner name="crescent" /> : <IonIcon icon={sendOutline} />}
            </IonButton>
          </div>
        )}
      </IonFooter>
    </IonPage>
  );
};

export default SupportChatScreen;