import "../../styles/landing.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Heart,
    Activity,
    Calendar,
    ChartLine,
    Calculator,
    Apple,
    Users,
    MapPin,
    Phone,
    Facebook,
    Instagram,
    Mail,
    Dumbbell,
    Target,
    TrendingUp,
    CheckCircle2,
    Menu,
    X,
    Zap,
    Award,
    Star
} from "lucide-react";

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('loading');

        try {
            const response = await fetch(import.meta.env.VITE_FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormStatus('success');
                setFormMessage('¡Mensaje enviado exitosamente! Nos contactaremos pronto.');
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    service: '',
                    message: ''
                });
                setTimeout(() => {
                    setFormStatus('idle');
                }, 5000);
            } else {
                setFormStatus('error');
                setFormMessage('Error al enviar el mensaje. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            setFormStatus('error');
            setFormMessage('Error de conexión. Intenta nuevamente.');
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="landing">
            {/* Header Navigation */}
            <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
                <div className="container">
                    <nav className="nav">
                        <motion.div 
                            className="logo"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Heart className="logo-icon" size={32} />
                            <span className="logo-text">FISIOVIDA</span>
                        </motion.div>

                        <motion.ul 
                            className={`nav-menu ${isMenuOpen ? 'active' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <li><a href="#hero" onClick={() => setIsMenuOpen(false)}>Inicio</a></li>
                            <li><a href="#features" onClick={() => setIsMenuOpen(false)}>Sistema Digital</a></li>
                            <li><a href="#services" onClick={() => setIsMenuOpen(false)}>Servicios</a></li>
                            <li><a href="#location" onClick={() => setIsMenuOpen(false)}>Ubicación</a></li>
                            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contacto</a></li>
                        </motion.ul>

                        <button 
                            className="menu-toggle"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero" id="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <motion.div
                        className="hero-badge"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ duration: 0.6 }}
                    >
                        <Heart className="icon-pulse" size={20} />
                        <span>Tu salud, nuestra prioridad</span>
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Bienvenido a <span className="brand-name">FISIOVIDA</span>
                    </motion.h1>
                    
                    <motion.p
                        className="hero-subtitle hero-subtitle-emphasis"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Zap className="inline-icon" size={24} />
                        Rehabilitamos, mantenemos y maximizamos tu movilidad brindando un servicio de <strong>máxima calidad</strong> 
                        de forma accesible para lograr una <strong>mejor calidad de vida</strong>
                    </motion.p>
                    
                    <motion.div
                        className="hero-highlights"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <div className="highlight-item">
                            <Award size={20} />
                            <span>Profesional Certificado</span>
                        </div>
                        <div className="highlight-item">
                            <Star size={20} />
                            <span>Tecnología Avanzada</span>
                        </div>
                        <div className="highlight-item">
                            <Heart size={20} />
                            <span>Atención Personalizada</span>
                        </div>
                    </motion.div>                    <motion.div
                        className="hero-buttons"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a href="#contact" className="btn btn-primary">
                            <Calendar size={20} />
                            Agenda tu Cita
                        </a>
                        <a href="#services" className="btn btn-secondary">
                            <Activity size={20} />
                            Conocer Servicios
                        </a>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <div className="stat">
                            <CheckCircle2 className="stat-icon" size={24} />
                            <div>
                                <h3>Profesional</h3>
                                <p>Certificado</p>
                            </div>
                        </div>
                        <div className="stat">
                            <Users className="stat-icon" size={24} />
                            <div>
                                <h3>Atención</h3>
                                <p>Personalizada</p>
                            </div>
                        </div>
                        <div className="stat">
                            <Target className="stat-icon" size={24} />
                            <div>
                                <h3>Resultados</h3>
                                <p>Garantizados</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    <div className="scroll-line"></div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Nuestro Sistema Digital</h2>
                        <p>Herramientas avanzadas para tu progreso y bienestar</p>
                    </motion.div>

                    <div className="features-grid">
                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <Calculator size={32} />
                            </div>
                            <h3>Calculadora Corporal</h3>
                            <p>Calcula tu IMC, porcentaje de grasa corporal y obtén recomendaciones personalizadas</p>
                        </motion.div>

                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <ChartLine size={32} />
                            </div>
                            <h3>Seguimiento Mensual</h3>
                            <p>Visualiza tu progreso mes con mes con gráficas y estadísticas detalladas</p>
                        </motion.div>

                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <Apple size={32} />
                            </div>
                            <h3>Plan Alimenticio</h3>
                            <p>Accede a tu plan nutricional personalizado diseñado por nuestro LFT certificado</p>
                        </motion.div>

                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <Dumbbell size={32} />
                            </div>
                            <h3>Rutinas Personalizadas</h3>
                            <p>Entrenamientos adaptados a tus objetivos y condición física actual</p>
                        </motion.div>

                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <Calendar size={32} />
                            </div>
                            <h3>Gestión de Citas</h3>
                            <p>Agenda y administra tus sesiones de fisioterapia y entrenamiento fácilmente</p>
                        </motion.div>

                        <motion.div
                            className="feature-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        >
                            <div className="feature-icon">
                                <TrendingUp size={32} />
                            </div>
                            <h3>Análisis de Resultados</h3>
                            <p>Reportes completos de tu evolución física y rehabilitación</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services" id="services">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Nuestros Servicios</h2>
                        <p>Atención integral para tu bienestar físico</p>
                    </motion.div>

                    <div className="services-grid">
                        <motion.div
                            className="service-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="service-content">
                                <Activity className="service-icon" size={48} />
                                <h3>Fisioterapia y Rehabilitación</h3>
                                <p>Recupera tu movilidad y fuerza después de lesiones o enfermedades. Tratamientos personalizados para:</p>
                                <ul>
                                    <li>✅ Recuperación post-lesión</li>
                                    <li>✅ Reducción de dolor e inflamación</li>
                                    <li>✅ Mejora de función muscular y articular</li>
                                    <li>✅ Prevención de lesiones futuras</li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            className="service-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="service-content">
                                <Dumbbell className="service-icon" size={48} />
                                <h3>Entrenamiento Personal</h3>
                                <p>Alcanza tus objetivos de fitness con planes diseñados específicamente para ti:</p>
                                <ul>
                                    <li>✅ Rutinas personalizadas según tu meta</li>
                                    <li>✅ Acompañamiento en tu entrenamiento</li>
                                    <li>✅ Ambiente cómodo y motivador</li>
                                    <li>✅ Seguimiento constante de avances</li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            className="service-card"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="service-content">
                                <Activity className="service-icon pulse" size={48} />
                                <h3>Descarga Muscular Deportiva</h3>
                                <p>Mejora tu rendimiento y acelera la recuperación post-entrenamiento:</p>
                                <ul>
                                    <li>✅ Eliminación de toxinas musculares</li>
                                    <li>✅ Reducción de dolor muscular</li>
                                    <li>✅ Prevención de lesiones</li>
                                    <li>✅ Mejora del rendimiento deportivo</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-choose">
                <div className="container">
                    <motion.div
                        className="why-choose-content"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="why-choose-text">
                            <h2>¿Por qué elegir FisioVida?</h2>
                            <p className="subtitle">Tu aliado en salud y bienestar</p>

                            <div className="reasons">
                                <div className="reason">
                                    <CheckCircle2 className="reason-icon" size={24} />
                                    <div>
                                        <h4>Atención Personalizada</h4>
                                        <p>Planes diseñados específicamente para tus necesidades y objetivos</p>
                                    </div>
                                </div>

                                <div className="reason">
                                    <CheckCircle2 className="reason-icon" size={24} />
                                    <div>
                                        <h4>Profesional Certificado</h4>
                                        <p>LFT German de los Santos Albino con experiencia comprobada</p>
                                    </div>
                                </div>

                                <div className="reason">
                                    <CheckCircle2 className="reason-icon" size={24} />
                                    <div>
                                        <h4>Tecnología Avanzada</h4>
                                        <p>Sistema digital para seguimiento y análisis de tu progreso</p>
                                    </div>
                                </div>

                                <div className="reason">
                                    <CheckCircle2 className="reason-icon" size={24} />
                                    <div>
                                        <h4>Resultados Comprobados</h4>
                                        <p>Mejora tu calidad de vida con métodos efectivos y seguros</p>
                                    </div>
                                </div>
                            </div>

                            <a href="#contact" className="btn btn-primary">
                                Comienza tu Transformación
                            </a>
                        </div>

                        <motion.div
                            className="why-choose-image"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <div className="image-card">
                                <Heart className="floating-icon" size={64} />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={scaleIn}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>¿Listo para comenzar tu transformación?</h2>
                        <p>No entrenes para cambiar quién eres, entrena para descubrir de lo que eres capaz</p>
                        <div className="cta-buttons">
                            <a href="#contact" className="btn btn-primary btn-large">
                                <Phone size={20} />
                                Contactar Ahora
                            </a>
                            <a href="tel:2381204843" className="btn btn-secondary btn-large">
                                <Calendar size={20} />
                                Llamar Directamente
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Location Section */}
            <section className="location" id="location">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Nuestra Ubicación</h2>
                        <p>Visítanos en Santa María Coapan, Tehuacán</p>
                    </motion.div>

                    <div className="location-content">
                        <motion.div
                            className="location-info"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="location-card">
                                <div className="location-icon-wrapper">
                                    <MapPin className="location-icon" size={40} />
                                </div>
                                <h3>Encuéntranos Aquí</h3>
                                <p className="location-address">
                                    <strong>Calle Allende Poniente #113</strong><br />
                                    Sta. María Coapan<br />
                                    Tehuacán, Puebla, México
                                </p>
                                <div className="location-details">
                                    <div className="detail-item">
                                        <Phone size={20} />
                                        <a href="tel:2381204843">238 120 4843</a>
                                    </div>
                                    <div className="detail-item">
                                        <Users size={20} />
                                        <span>LFT German de los Santos Albino</span>
                                    </div>
                                </div>
                                <a 
                                    href="https://www.google.com/maps/place/18%C2%B026'02.8%22N+97%C2%B024'18.2%22W/@18.4340646,-97.4050498,20z"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <MapPin size={20} />
                                    Abrir en Google Maps
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            className="location-map"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scaleIn}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d236.5683106025903!2d-97.40505711412077!3d18.434087481943703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c5bd816386a7d1%3A0xe7193d7de5c09f46!2sAllende%20Pte.%20113%2C%20Santa%20Mar%C3%ADa%20Coapan%2C%20Sta%20Mar%C3%ADa%20Coapan%2C%2075857%20Tehuac%C3%A1n%2C%20Pue.!5e0!3m2!1ses-419!2smx!4v1763269300465!5m2!1ses-419!2smx"
                                width="100%"
                                height="500"
                                style={{ border: 0, borderRadius: '20px' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación de FisioVida"
                            ></iframe>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact" id="contact">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Contáctanos</h2>
                        <p>Agenda tu cita y comienza a sentirte mejor</p>
                    </motion.div>

                    <div className="contact-grid">
                        <motion.div
                            className="contact-info"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3>Información de Contacto</h3>

                            <div className="contact-item">
                                <Phone className="contact-icon" size={24} />
                                <div>
                                    <h4>Teléfono</h4>
                                    <a href="tel:2381204843">238 120 4843</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <MapPin className="contact-icon" size={24} />
                                <div>
                                    <h4>Ubicación</h4>
                                    <p>Calle Allende Poniente #113<br />Sta. María Coapan<br />Tehuacán, Puebla, México</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <Mail className="contact-icon" size={24} />
                                <div>
                                    <h4>Profesional</h4>
                                    <p>LFT German de los Santos Albino</p>
                                </div>
                            </div>

                            <div className="social-links">
                                <h4>Síguenos en Redes Sociales</h4>
                                <div className="social-icons">
                                    <a href="https://www.facebook.com/share/1AAx57GE17/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <Facebook size={24} />
                                        <span>Fisio Vida</span>
                                    </a>
                                    <a href="https://instagram.com/fisiovida._" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <Instagram size={24} />
                                        <span>@fisiovida._</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="contact-form-container"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <form className="contact-form" onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        name="phone" 
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="service">Servicio de Interés</label>
                                    <select 
                                        id="service" 
                                        name="service" 
                                        value={formData.service}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">Selecciona un servicio</option>
                                        <option value="fisioterapia">Fisioterapia y Rehabilitación</option>
                                        <option value="entrenamiento">Entrenamiento Personal</option>
                                        <option value="descarga">Descarga Muscular</option>
                                        <option value="nutricion">Plan Alimenticio</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Mensaje</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        value={formData.message}
                                        onChange={handleFormChange}
                                        rows={4}
                                    ></textarea>
                                </div>

                                {formMessage && (
                                    <div className={`form-message form-message-${formStatus}`}>
                                        {formMessage}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-block"
                                    disabled={formStatus === 'loading'}
                                >
                                    {formStatus === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>FISIOVIDA</h3>
                            <p>Rehabilitamos, mantenemos y maximizamos tu movilidad para lograr una mejor calidad de vida.</p>
                        </div>

                        <div className="footer-section">
                            <h4>Servicios</h4>
                            <ul>
                                <li><a href="#services">Fisioterapia</a></li>
                                <li><a href="#services">Entrenamiento Personal</a></li>
                                <li><a href="#services">Descarga Muscular</a></li>
                                <li><a href="#services">Nutrición</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Contacto</h4>
                            <ul>
                                <li><a href="tel:2381204843">238 120 4843</a></li>
                                <li>Sta. María Coapan</li>
                                <li>Tehuacán, Puebla</li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Síguenos</h4>
                            <div className="footer-social">
                                <a href="https://www.facebook.com/share/1AAx57GE17/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                                    <Facebook size={20} />
                                </a>
                                <a href="https://instagram.com/fisiovida._" target="_blank" rel="noopener noreferrer">
                                    <Instagram size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 FISIOVIDA. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}