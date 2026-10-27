import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButtons,
  IonButton,
  IonChip,
  IonLabel,
  useIonRouter
} from '@ionic/react';
import { add, ellipse } from 'ionicons/icons';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import './HomeScreen.css';

const API_URL = 'https://api-doriga.onrender.com/api';

const HomeScreen: React.FC = () => {
  const router = useIonRouter();
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('U');
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todas');

  const categorias = ['Todas', 'Política', 'Tecnología', 'Economía'];
  const getImageUrl = (ruta: string) => {
    if (!ruta) return undefined;
    // Si la ruta ya es un enlace completo (ej. fotos anteriores), la retorna tal cual
    if (ruta.startsWith('http')) return ruta;
    // Si es una ruta relativa de tu backend, le concatena tu dominio de Render
    return `https://api-doriga.onrender.com${ruta}`;
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { value: userStr } = await Preferences.get({ key: 'user' });
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.tipo || 'Lector');
        
        // Obtener iniciales del nombre (ej. "Jonathan Cruz" -> "JC")
        if (user.nombre) {
          const names = user.nombre.split(' ');
          const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
          setUserInitials(initials.toUpperCase());
        }
      }

      const { value: token } = await Preferences.get({ key: 'token' });
      
      const response = await axios.get(`${API_URL}/noticias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNoticias(response.data);
    } catch (error) {
      console.error("Error cargando noticias", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado local de noticias según la categoría seleccionada
  const noticiasFiltradas = categoriaActiva === 'Todas' 
    ? noticias 
    : noticias.filter(n => n.categoria === categoriaActiva);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="home-toolbar">
          
          <div slot="start" className="profile-container">
            <div className="avatar-circle">{userInitials}</div>
            <div className="role-badge">{userRole}</div>
          </div>

          <IonTitle className="home-title">DorigaNews</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={async () => {
              await Preferences.remove({ key: 'token' });
              await Preferences.remove({ key: 'user' });
              router.push('/login', 'root', 'replace');
            }}>
              Cerrar Sesión
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="home-content">
        
        {/* Scroll Horizontal de Categorías */}
        <div className="categories-scroll">
          {categorias.map(cat => (
            <IonChip 
              key={cat} 
              className={categoriaActiva === cat ? 'chip-active' : 'chip-inactive'}
              onClick={() => setCategoriaActiva(cat)}
            >
              <IonLabel>{cat}</IonLabel>
            </IonChip>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="feed-container">
            {noticiasFiltradas.map((noticia) => (
              <IonCard key={noticia.id} className="news-card">
                
                {/* Imagen de portada */}
                <div className="news-image-container">
                  {noticia.imagen ? (
                    <img 
                      src={getImageUrl(noticia.imagen)} 
                      alt="Portada" 
                      className="news-image" 
                    />
                  ) : (
                    <div className="news-image-placeholder">Imagen de portada</div>
                  )}
                </div>

                <IonCardHeader className="news-header">
                  <div className="news-category-badge">{noticia.categoria || 'General'}</div>
                  <IonCardTitle className="news-title">{noticia.titulo}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent className="news-footer">
                  <div className="news-meta">
                    {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} • {noticia.nombre_autor || 'DorigaNews'}
                </div>
                  <div className="biometric-badge">
                    <IonIcon icon={ellipse} className="biometric-dot" />
                    Verificado por Biometría
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Botón flotante para crear noticia */}
        {(userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'reportero') && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => router.push('/crear-noticia')} className="fab-button">
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}

      </IonContent>
    </IonPage>
  );
};

export default HomeScreen;