import {useRoute} from '@react-navigation/native';
import BottomNav from '../../layouts/navigations/bottomNav';

export function ConditionalBottomNav() {
  const route = useRoute();
  const excludedRoutes = ['Login', 'Signup', 'Splash'];

  if (route && !excludedRoutes.includes(route.name)) {
    return <BottomNav />;
  }
  return null;
}
