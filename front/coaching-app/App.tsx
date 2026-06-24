import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { seedDemoAccessIfEmpty } from './lib/accessStore';
import type { AuthUser } from './lib/dummyAuth';
import { seedDefaultMediaIfEmpty } from './lib/mediaStore';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PdfViewerScreen } from './screens/PdfViewerScreen';
import { VideoPlayerScreen } from './screens/VideoPlayerScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

type Route =
  | { name: 'welcome' }
  | { name: 'login'; role: 'student' | 'admin' }
  | { name: 'student'; user: AuthUser }
  | { name: 'admin'; user: AuthUser };

type Viewer = { type: 'video' | 'pdf'; id: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'welcome' });
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([seedDemoAccessIfEmpty(), seedDefaultMediaIfEmpty()]).finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  if (viewer?.type === 'video' && (route.name === 'student' || route.name === 'admin')) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <VideoPlayerScreen id={viewer.id} onClose={() => setViewer(null)} />
      </SafeAreaProvider>
    );
  }

  if (viewer?.type === 'pdf' && (route.name === 'student' || route.name === 'admin')) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <PdfViewerScreen id={viewer.id} onClose={() => setViewer(null)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {route.name === 'welcome' ? (
        <WelcomeScreen
          onStudentLogin={() => setRoute({ name: 'login', role: 'student' })}
          onAdminLogin={() => setRoute({ name: 'login', role: 'admin' })}
        />
      ) : null}

      {route.name === 'login' ? (
        <LoginScreen
          role={route.role}
          onBack={() => setRoute({ name: 'welcome' })}
          onLogin={(user) => {
            if (user.role === 'admin') setRoute({ name: 'admin', user });
            else setRoute({ name: 'student', user });
          }}
        />
      ) : null}

      {route.name === 'student' ? (
        <DashboardScreen
          user={route.user}
          onOpenVideo={(id) => setViewer({ type: 'video', id })}
          onOpenPdf={(id) => setViewer({ type: 'pdf', id })}
          onSignOut={() => setRoute({ name: 'welcome' })}
        />
      ) : null}

      {route.name === 'admin' ? (
        <AdminDashboardScreen
          user={route.user}
          onPreviewVideo={(id) => setViewer({ type: 'video', id })}
          onPreviewPdf={(id) => setViewer({ type: 'pdf', id })}
          onSignOut={() => setRoute({ name: 'welcome' })}
        />
      ) : null}
    </SafeAreaProvider>
  );
}
