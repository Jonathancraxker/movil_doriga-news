import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonToggle, IonModal, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonSpinner, IonAlert, useIonViewWillEnter
} from '@ionic/react';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import './CreateNewsScreen.css'; 

const API_URL = 'https://api-doriga.onrender.com/api';

const RegisterUserScreen: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario (Modal)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', pin: '', tipo: 'User', activo: 1 });
  
  // Alertas
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, header: '', message: '' });
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, userId: null as number | null, userName: '' });

  useIonViewWillEnter(() => {
    cargarUsuarios();
  });

  const getHeaders = async () => {
    const { value: token } = await Preferences.get({ key: 'token' });
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const config = await getHeaders();
      const response = await axios.get(`${API_URL}/usuarios`, config);
      setUsuarios(response.data);
    } catch (error: any) {
      setAlertInfo({ isOpen: true, header: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ nombre: '', email: '', pin: '', tipo: 'User', activo: 1 });
    setShowModal(true);
  };

  const handleOpenEditModal = (u: any) => {
    setEditingId(u.id);
    // Vaciamos el PIN en el estado, aunque no se mostrará visualmente
    setFormData({ nombre: u.nombre, email: u.email, pin: '', tipo: u.tipo, activo: u.activo ? 1 : 0 });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.tipo) {
      setAlertInfo({ isOpen: true, header: 'Campos vacíos', message: 'Llena todos los campos requeridos.' });
      return;
    }

    try {
      const config = await getHeaders();
      if (editingId) {
        // En modo edición, omitimos el PIN de la carga de datos (payload)
        const dataToUpdate = {
          nombre: formData.nombre,
          email: formData.email,
          tipo: formData.tipo,
          activo: formData.activo
        };
        await axios.put(`${API_URL}/usuarios/${editingId}`, dataToUpdate, config);
        setAlertInfo({ isOpen: true, header: '¡Actualizado!', message: 'Usuario modificado correctamente.' });
      } else {
        // En modo creación, validamos y enviamos el PIN
        if (!formData.pin) {
          setAlertInfo({ isOpen: true, header: 'Falta el PIN', message: 'El PIN es obligatorio para nuevos usuarios.' });
          return;
        }
        await axios.post(`${API_URL}/usuarios`, formData, config);
        setAlertInfo({ isOpen: true, header: '¡Creado!', message: 'Usuario registrado con éxito.' });
      }
      setShowModal(false);
      cargarUsuarios();
    } catch (error: any) {
      setAlertInfo({ isOpen: true, header: 'Error', message: error.response?.data?.message || 'Error al guardar.' });
    }
  };

  const handleToggleEstado = async (u: any) => {
    try {
      const config = await getHeaders();
      const nuevoEstado = u.activo ? 0 : 1;
      
      // 🔄 Corregido: PATCH a /usuarios/ID/activo como se indicó en el network
      await axios.patch(`${API_URL}/usuarios/${u.id}/activo`, { activo: nuevoEstado }, config);
      
      cargarUsuarios();
    } catch (error: any) {
      setAlertInfo({ isOpen: true, header: 'Error', message: 'No se pudo cambiar el estado.' });
    }
  };

  const confirmarEliminar = async () => {
    if (!deleteAlert.userId) return;
    try {
      const config = await getHeaders();
      await axios.delete(`${API_URL}/usuarios/${deleteAlert.userId}`, config);
      setAlertInfo({ isOpen: true, header: '¡Eliminado!', message: 'Usuario borrado exitosamente.' });
      cargarUsuarios();
    } catch (error: any) {
      setAlertInfo({ isOpen: true, header: 'Error', message: 'No se pudo eliminar al usuario.' });
    } finally {
      setDeleteAlert({ isOpen: false, userId: null, userName: '' });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" className="back-btn" /></IonButtons>
          <IonTitle className="create-title">Gestión de Usuarios</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleOpenCreateModal}>
              <IonIcon icon={addOutline} style={{ fontSize: '26px', color: '#2563EB' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="create-content" style={{ padding: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}><IonSpinner name="crescent" color="primary" /></div>
        ) : (
          usuarios.map(u => (
            <IonCard key={u.id} style={{ margin: '10px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <IonCardHeader style={{ paddingBottom: '0' }}>
                <IonCardTitle style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{u.nombre}</IonCardTitle>
                <IonCardSubtitle>{u.email} • <span style={{ color: '#2563EB', fontWeight: 'bold' }}>{u.tipo}</span></IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <IonToggle 
                  checked={u.activo === 1 || u.activo === true} 
                  onIonChange={() => handleToggleEstado(u)}
                >
                  <span style={{ fontSize: '0.85rem' }}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                </IonToggle>
                <div>
                  <IonButton fill="clear" color="warning" onClick={() => handleOpenEditModal(u)}>
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => setDeleteAlert({ isOpen: true, userId: u.id, userName: u.nombre })}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        {/* MODAL FORMULARIO */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} initialBreakpoint={0.85} breakpoints={[0, 0.85, 1]}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</IonTitle>
              <IonButtons slot="end"><IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton></IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="form-container">
              
              <IonLabel className="form-label">Nombre Completo</IonLabel>
              <IonItem className="custom-input" lines="none">
                <IonInput value={formData.nombre} onIonInput={(e) => setFormData({...formData, nombre: e.detail.value!})} />
              </IonItem>

              <IonLabel className="form-label">Correo Electrónico</IonLabel>
              <IonItem className="custom-input" lines="none">
                <IonInput type="email" value={formData.email} onIonInput={(e) => setFormData({...formData, email: e.detail.value!})} />
              </IonItem>

              {/* 🔒 El campo PIN solo se renderiza si estamos creando un nuevo usuario (editingId es nulo) */}
              {!editingId && (
                <>
                  <IonLabel className="form-label">PIN (Números)</IonLabel>
                  <IonItem className="custom-input" lines="none">
                    <IonInput 
                      type="password" 
                      inputmode="numeric" 
                      pattern="[0-9]*" 
                      placeholder="Asigna PIN numérico"
                      value={formData.pin} 
                      onIonInput={(e) => setFormData({...formData, pin: e.detail.value!})} 
                    />
                  </IonItem>
                </>
              )}

              <IonLabel className="form-label">Rol</IonLabel>
              <IonItem className="custom-input" lines="none" style={{marginBottom: '10px'}}>
                <IonSelect value={formData.tipo} onIonChange={(e) => setFormData({...formData, tipo: e.detail.value})} interface="popover">
                  <IonSelectOption value="User">Lector</IonSelectOption>
                  <IonSelectOption value="Reportero">Reportero</IonSelectOption>
                  <IonSelectOption value="Admin">Admin</IonSelectOption>
                  <IonSelectOption value="Directivo">Directivo</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonLabel className="form-label">Estado de la cuenta</IonLabel>
              <IonItem className="custom-input" lines="none">
                <IonSelect value={formData.activo} onIonChange={(e) => setFormData({...formData, activo: parseInt(e.detail.value)})} interface="popover">
                  <IonSelectOption value={1}>Activo</IonSelectOption>
                  <IonSelectOption value={0}>Inactivo</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonButton expand="block" className="publish-btn" onClick={handleSubmit}>
                {editingId ? 'Guardar Cambios' : 'Registrar'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* ALERTA ELIMINAR */}
        <IonAlert
          isOpen={deleteAlert.isOpen}
          onDidDismiss={() => setDeleteAlert({ isOpen: false, userId: null, userName: '' })}
          header="Confirmar Eliminación"
          message={`¿Estás seguro de eliminar a ${deleteAlert.userName}?`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Sí, Eliminar', role: 'destructive', handler: confirmarEliminar }
          ]}
        />

        {/* ALERTA MENSAJES GENÉRICOS */}
        <IonAlert
          isOpen={alertInfo.isOpen}
          onDidDismiss={() => setAlertInfo({ ...alertInfo, isOpen: false })}
          header={alertInfo.header}
          message={alertInfo.message}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterUserScreen;