import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import LoginScreen from './pages/LoginScreen';
import HomeScreen from './pages/HomeScreen';
import CreateNewsScreen from './pages/CreateNewsScreen';
import NewsDetailScreen from './pages/NewsDetailScreen';
import RegisterUserScreen from './pages/RegisterUserScreen';
import SupportChatScreen from './pages/SupportChatScreen';
import SupportListScreen from './pages/SupportListScreen';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/crear-noticia" element={<CreateNewsScreen />} />
        <Route path="/noticia/:id" element={<NewsDetailScreen />} />
        <Route path="/registrar-usuario" element={<RegisterUserScreen />} />
        <Route path="/soporte" element={<SupportListScreen />} />
        <Route path="/soporte/chat/:id" element={<SupportChatScreen />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
