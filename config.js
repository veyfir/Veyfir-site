// Edit these values when your releases and EmailJS template are ready.
// Leave a download link empty if the installer has not been published yet.
window.VEYFIR_CONFIG = {
  downloads: {
    windows: '', // e.g. https://github.com/your-account/veyfir/releases/download/v1.0/Veyfir-Setup.exe
    mac: 'downloads/macos/Veyfir-0.3.3-build22-macOS-arm64-unsigned.dmg'      // e.g. https://github.com/your-account/veyfir/releases/download/v1.0/Veyfir.dmg
  },
  emailjs: {
    publicKey: '_klPEPRqu4qGtVLNg', // https://dashboard.emailjs.com/admin/account
    serviceId: 'service_axblrc6', // EmailJS Email Services
    templateId: 'template_to5wanz' // EmailJS Email Templates (create a Veyfir template)
  },
  supportEmail: '' // Optional: fallback opens user's email application via mailto
};
