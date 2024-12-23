export const dictionary = {
  en: {
    steps: {
      instance: 'Creating instance',
      organization: 'Setting up organization',
      organizationReady: 'Configuring organization',
      assistantAccess: 'Giving assistant access',
      organizationFinal: 'Final adjustments',
      errorInstance: 'Error creating instance:',
      errorOrganization: 'Error setting up organization:',
      errorOrganizationReady: 'Error configuring organization:',
      errorAssistantAccess: 'Error configuring organization:',
    },
    ui: {
      back: 'Back',
      createNewEnv: 'Create New Environment',
      createNewEnvDesc:
        'Set up a new environment for your organization. Fill in the details below.',
      companyName: 'Company Name',
      enterCompanyName: 'Enter company name',
      industry: 'Industry',
      selectIndustry: 'Select industry',
      cancel: 'Cancel',
      createEnv: 'Create Environment',
      errorCreatingEnv: 'Error creating environment:',
      envCreated: 'Environment created with ID:',
      envCreationComplete: 'Environment creation complete. Redirecting to dashboard.',
    },
    dashboard: {
      environmentManager: 'Environment Manager',
      yourEnvironments: 'Your Environments',
      manageMonitor: 'Manage and monitor your deployment environments',
      newEnvironment: 'New Environment',
      systemAccess: 'System Access',
      noEnvironmentsYet: 'No environments yet',
      createFirstEnvironment:
        'Create your first environment to get started with deployments',
      createdOn: 'Created on',
      adminAccess: 'Admin Access',
      userAccess: 'User Access',
    },
    login: {
      welcomeTitle: 'Welcome to Environment Manager',
      welcomeDescription: 'Sign in to manage your environments and settings',
      signInTerms: 'By signing in, you agree to our Terms of Service and Privacy Policy',
    },
    languages: {
      english: 'English',
      spanish: 'Spanish',
    },
  },

  es: {
    steps: {
      instance: 'Creando instancia',
      organization: 'Configurando organización',
      organizationReady: 'Configurando la organización',
      assistantAccess: 'Otorgando acceso al asistente',
      organizationFinal: 'Ajustes finales',
      errorInstance: 'Error al crear la instancia:',
      errorOrganization: 'Error al configurar la organización:',
      errorOrganizationReady: 'Error al terminar de configurar la organización:',
      errorAssistantAccess: 'Error al terminar de configurar la organización:',
    },
    ui: {
      back: 'Regresar',
      createNewEnv: 'Crear nuevo entorno',
      createNewEnvDesc:
        'Configura un nuevo entorno para tu organización. Completa los siguientes campos.',
      companyName: 'Nombre de la empresa',
      enterCompanyName: 'Ingresa el nombre de la empresa',
      industry: 'Industria',
      selectIndustry: 'Selecciona la industria',
      cancel: 'Cancelar',
      createEnv: 'Crear entorno',
      errorCreatingEnv: 'Error al crear el entorno:',
      envCreated: 'Entorno creado con ID:',
      envCreationComplete: 'Creación de entorno completa. Redirigiendo al dashboard.',
    },
    dashboard: {
      environmentManager: 'Gestor de Entornos',
      yourEnvironments: 'Tus Entornos',
      manageMonitor: 'Administra y supervisa tus entornos de despliegue',
      newEnvironment: 'Nuevo Entorno',
      systemAccess: 'Acceso al Sistema',
      noEnvironmentsYet: 'No hay entornos todavía',
      createFirstEnvironment:
        'Crea tu primer entorno para comenzar con los despliegues',
      createdOn: 'Creado el',
      adminAccess: 'Acceso Admin',
      userAccess: 'Acceso Usuario',
    },
    login: {
      welcomeTitle: 'Bienvenido a Environment Manager',
      welcomeDescription: 'Inicia sesión para administrar tus entornos y configuraciones',
      signInTerms: 'Al iniciar sesión, aceptas nuestros Términos de servicio y Política de privacidad',
    },
    languages: {
      english: 'Inglés',
      spanish: 'Español',
    },
  },
} as const;