import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { ellipse } from 'ionicons/icons';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import './NewsDetailScreen.css';

const API_URL = 'https://api-doriga.onrender.com/api';

const NewsDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [noticia, setNoticia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarNoticia();
  }, [id]);

  const cargarNoticia = async () => {
    try {
      const { value: token } = await Preferences.get({ key: 'token' });
      const response = await axios.get(`${API_URL}/noticias/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNoticia(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la noticia.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (ruta: string) => {
    if (!ruta) return undefined;
    if (ruta.startsWith('http')) return ruta;
    return `https://api-doriga.onrender.com${ruta}`;
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="detail-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" className="back-btn" />
          </IonButtons>
          <IonTitle className="detail-title">DorigaNews</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="detail-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : noticia ? (
          <div className="article-container">
            <div className="article-header">
              <span className="category-badge">{noticia.categoria}</span>
              <h1 className="article-title">{noticia.titulo}</h1>
              <div className="article-meta">
                <span>Por {noticia.nombre_autor || 'Autor Desconocido'}</span>
                <span>•</span>
                <span>
                  {new Date(noticia.fecha_publicacion || new Date()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="biometric-badge-detail">
                <IonIcon icon={ellipse} className="biometric-dot" />
                Autoría verificada por biometría
              </div>
            </div>

            {noticia.imagen && (
              <img 
                src={getImageUrl(noticia.imagen)} 
                alt="Portada" 
                className="article-image" 
              />
            )}

            <div className="article-body">
              {/* Dividimos el texto por saltos de línea para mantener los párrafos */}
              {noticia.contenido.split('\n').map((parrafo: string, index: number) => (
                <p key={index}>{parrafo}</p>
              ))}
            </div>
          </div>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default NewsDetailScreen;