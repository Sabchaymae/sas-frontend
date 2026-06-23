import api from './api';

class DashboardService {
  // Get KPI data
  async getKPIs() {
    try {
      const response = await api.get('/api/dashboard/kpis');
      return response.data || this.getMockKPIs();
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return this.getMockKPIs();
    }
  }

  // Get alerts
  async getAlerts() {
    try {
      const response = await api.get('/api/dashboard/alerts');
      return response.data || this.getMockAlerts();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return this.getMockAlerts();
    }
  }

  // Get activity feed
  async getActivity() {
    try {
      const response = await api.get('/api/dashboard/activity');
      return response.data || this.getMockActivity();
    } catch (error) {
      console.error('Error fetching activity:', error);
      return this.getMockActivity();
    }
  }

  // Get performance data
  async getPerformance(filter = 'day') {
    try {
      const response = await api.get(`/api/dashboard/performance?filter=${filter}`);
      return response.data || this.getMockPerformance(filter);
    } catch (error) {
      console.error('Error fetching performance:', error);
      return this.getMockPerformance(filter);
    }
  }

  // Get AI suggestions
  async getAISuggestions() {
    try {
      const response = await api.get('/api/dashboard/ai-suggestions');
      return response.data || this.getMockAISuggestions();
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      return this.getMockAISuggestions();
    }
  }

  // Get distribution charts
  async getCharts() {
    try {
      const response = await api.get('/api/dashboard/charts');
      return response.data || this.getMockCharts();
    } catch (error) {
      console.error('Error fetching charts:', error);
      return this.getMockCharts();
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      const response = await api.get('/api/dashboard/system-health');
      return response.data || this.getMockSystemHealth();
    } catch (error) {
      console.error('Error fetching system health:', error);
      return this.getMockSystemHealth();
    }
  }

  // Mock data for development
  getMockKPIs() {
    return {
      activeUsers: { total: 124, change: 12.5, trend: 'up' },
      activeFolders: { count: 456, change: 8.3, trend: 'up' },
      activeAlerts: { count: 23, severity: 'high' },
      overdueTasks: { count: 12, percentage: 8.5 },
      newMessages: { count: 34, change: -5.2, trend: 'down' }
    };
  }

  getMockAlerts() {
    return [
      {
        id: 1,
        type: 'inactive_user',
        title: 'Utilisateur inactif',
        description: 'Karim Benzema n\'a pas pointé depuis 3 jours',
        priority: 'high',
        date: new Date(Date.now() - 3600000).toISOString(),
        icon: 'user',
        color: 'red',
        action: 'Voir profil'
      },
      {
        id: 2,
        type: 'blocked_folder',
        title: 'Dossier bloqué',
        description: 'Dossier #F-2024-123 nécessite une validation',
        priority: 'medium',
        date: new Date(Date.now() - 7200000).toISOString(),
        icon: 'folder',
        color: 'orange',
        action: 'Ouvrir dossier'
      },
      {
        id: 3,
        type: 'rejected_subscription',
        title: 'Souscription rejetée',
        description: 'Demande d\'agence ABC a été refusée',
        priority: 'low',
        date: new Date(Date.now() - 10800000).toISOString(),
        icon: 'credit-card',
        color: 'blue',
        action: 'Voir détails'
      }
    ];
  }

  getMockActivity() {
    return [
      { id: 1, type: 'login', user: 'Admin Oriotel', action: 'Connexion réussie', time: 'Il y a 5 min' },
      { id: 2, type: 'create_folder', user: 'Yassine Animateur', action: 'Création dossier #F-2024-567', time: 'Il y a 12 min' },
      { id: 3, type: 'validation', user: 'Sarah Opérateur', action: 'Validation dossier #F-2024-456', time: 'Il y a 25 min' },
      { id: 4, type: 'assignment', user: 'Admin Oriotel', action: 'Affectation tâche #T-2024-89 à Karim', time: 'Il y a 1h' },
      { id: 5, type: 'rejection', user: 'Sarah Opérateur', action: 'Rejet demande #D-2024-145', time: 'Il y a 2h' }
    ];
  }

  getMockPerformance(filter) {
    const data = {
      day: [
        { name: '08h', folders: 12, subscriptions: 8, validation: 95, productivity: 88 },
        { name: '10h', folders: 23, subscriptions: 15, validation: 92, productivity: 92 },
        { name: '12h', folders: 34, subscriptions: 18, validation: 94, productivity: 95 },
        { name: '14h', folders: 45, subscriptions: 22, validation: 91, productivity: 90 },
        { name: '16h', folders: 52, subscriptions: 28, validation: 96, productivity: 94 },
        { name: '18h', folders: 58, subscriptions: 32, validation: 93, productivity: 91 }
      ],
      week: [
        { name: 'Lun', folders: 120, subscriptions: 65, validation: 94, productivity: 92 },
        { name: 'Mar', folders: 145, subscriptions: 78, validation: 92, productivity: 90 },
        { name: 'Mer', folders: 132, subscriptions: 68, validation: 95, productivity: 94 },
        { name: 'Jeu', folders: 158, subscriptions: 85, validation: 93, productivity: 91 },
        { name: 'Ven', folders: 142, subscriptions: 75, validation: 96, productivity: 95 }
      ],
      month: [
        { name: 'Sem1', folders: 540, subscriptions: 280, validation: 93, productivity: 92 },
        { name: 'Sem2', folders: 580, subscriptions: 310, validation: 94, productivity: 93 },
        { name: 'Sem3', folders: 520, subscriptions: 270, validation: 92, productivity: 91 },
        { name: 'Sem4', folders: 610, subscriptions: 330, validation: 95, productivity: 94 }
      ],
      year: [
        { name: 'Jan', folders: 2100, subscriptions: 1100, validation: 92, productivity: 90 },
        { name: 'Fév', folders: 1900, subscriptions: 950, validation: 93, productivity: 91 },
        { name: 'Mar', folders: 2300, subscriptions: 1200, validation: 94, productivity: 93 },
        { name: 'Avr', folders: 2400, subscriptions: 1250, validation: 95, productivity: 94 },
        { name: 'Mai', folders: 2600, subscriptions: 1350, validation: 96, productivity: 95 }
      ]
    };
    return data[filter] || data.day;
  }

  getMockAISuggestions() {
    return [
      {
        id: 1,
        type: 'follow_up',
        title: 'Utilisateurs à relancer',
        description: '5 utilisateurs n\'ont pas complété leur profil depuis plus de 7 jours',
        score: 0.92,
        explanation: 'Basé sur le taux de complétion et l\'historique d\'activité',
        action: 'Envoyer rappels'
      },
      {
        id: 2,
        type: 'risk',
        title: 'Dossiers à risque',
        description: '12 dossiers risquent de dépasser la date butoir',
        score: 0.87,
        explanation: 'Analyse des délais moyens et de la charge de travail',
        action: 'Prioriser'
      },
      {
        id: 3,
        type: 'overload',
        title: 'Agents surchargés',
        description: 'Sarah Opérateur a une charge 35% supérieure à la moyenne',
        score: 0.81,
        explanation: 'Comparaison avec la charge opérationnelle moyenne',
        action: 'Réallouer'
      }
    ];
  }

  getMockCharts() {
    return {
      agency: [
        { name: 'Casablanca', value: 35 },
        { name: 'Rabat', value: 25 },
        { name: 'Marrakech', value: 20 },
        { name: 'Tanger', value: 12 },
        { name: 'Fès', value: 8 }
      ],
      region: [
        { name: 'Centre', value: 40 },
        { name: 'Nord', value: 30 },
        { name: 'Sud', value: 20 },
        { name: 'Est', value: 10 }
      ],
      status: [
        { name: 'Validé', value: 65 },
        { name: 'En cours', value: 20 },
        { name: 'Rejeté', value: 10 },
        { name: 'Bloqué', value: 5 }
      ],
      operator: [
        { name: 'Sarah', value: 45 },
        { name: 'Yassine', value: 35 },
        { name: 'Karim', value: 20 }
      ]
    };
  }

  getMockSystemHealth() {
    return {
      api: { status: 'online', responseTime: '45ms', uptime: '99.9%' },
      database: { status: 'online', responseTime: '12ms', uptime: '99.9%' },
      redis: { status: 'online', responseTime: '5ms', uptime: '99.9%' },
      ai: { status: 'online', responseTime: '150ms', uptime: '99.5%' },
      docker: { status: 'online', responseTime: '10ms', uptime: '99.8%' },
      zkteco: { status: 'online', responseTime: '35ms', uptime: '98.5%' }
    };
  }
}

export const dashboardService = new DashboardService();
