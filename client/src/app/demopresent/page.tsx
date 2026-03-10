'use client';

import { useEffect } from 'react';
import mermaid from 'mermaid';

export default function DemoPresent() {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
        });
        mermaid.contentLoaded();
    }, []);

    return (
        <div className="bg-[#0f172a] text-[#f8fafc] font-['Outfit',_sans-serif] leading-relaxed overflow-x-hidden min-h-screen">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=JetBrains+Mono&display=swap');
                
                :root {
                    --primary: #2563eb;
                    --primary-light: #60a5fa;
                    --secondary: #10b981;
                    --accent: #f59e0b;
                    --bg-dark: #0f172a;
                    --bg-card: rgba(30, 41, 59, 0.7);
                    --text-main: #f8fafc;
                    --text-dim: #94a3b8;
                    --glass-border: rgba(255, 255, 255, 0.1);
                }

                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-glow { 0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }
                
                .animate-fade-in { animation: fadeInUp 1s ease-out forwards; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                section { padding: 6rem 0; border-bottom: 1px solid var(--glass-border); }

                /* Hero */
                .hero { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%); position: relative; }
                .hero h1 { font-size: clamp(3rem, 10vw, 5rem); font-weight: 900; letter-spacing: -0.05em; margin-bottom: 1.5rem; background: linear-gradient(to right, #fff, var(--primary-light)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
                .hero p { font-size: 1.5rem; color: var(--text-dim); max-width: 800px; }
                .badge-247 { margin-top: 2rem; padding: 0.75rem 1.5rem; background: rgba(37, 99, 235, 0.1); border: 1px solid var(--primary); border-radius: 999px; color: var(--primary-light); font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.8rem; animation: pulse-glow 2s infinite; }

                /* Grid & Cards */
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 4rem; }
                .card { background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 2rem; padding: 2.5rem; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .card:hover { transform: translateY(-10px); border-color: var(--primary); background: rgba(30, 41, 59, 0.9); }
                .card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: #fff; }
                .card p { color: var(--text-dim); font-size: 1rem; }
                .card-icon { width: 3rem; height: 3rem; background: rgba(37, 99, 235, 0.1); border-radius: 1rem; display: flex; align-items: center; justify-content: center; color: var(--primary-light); font-size: 1.5rem; margin-bottom: 2rem; }
                .tech-stack { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--primary-light); margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); }
                .tech-stats { margin-top: 1rem; }

                /* Diagrams */
                .diagram-container { background: rgba(0, 0, 0, 0.3); border-radius: 3rem; padding: 4rem; margin-top: 3rem; border: 1px solid var(--glass-border); }
                .section-title { text-align: center; margin-top: 4rem; margin-bottom: 4rem; }
                .section-title h2 { font-size: 3rem; font-weight: 900; margin-bottom: 1rem; }
                .section-title p { color: var(--text-dim); font-size: 1.2rem; max-width: 600px; margin: 0 auto; }

                /* Comparison */
                .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 4rem; }
                .comp-box { padding: 3rem; border-radius: 3rem; position: relative; }
                .comp-old { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); }
                .comp-new { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); }
                .comp-title { font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9rem; margin-bottom: 2rem; display: block; }
                .comp-item { margin-bottom: 1.5rem; display: flex; gap: 1rem; font-weight: 600; font-size: 1.05rem; }

                /* FAQ Section */
                .faq-grid { display: grid; gap: 2rem; margin-top: 4rem; }
                .faq-item { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 2rem; padding: 2.5rem; }
                .faq-q { color: var(--primary-light); font-weight: 900; font-size: 1.3rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
                .faq-a { color: var(--text-dim); font-size: 1.1rem; }

                @media (max-width: 768px) {
                    .hero h1 { font-size: 3rem; }
                    .comparison { grid-template-columns: 1fr; }
                    .diagram-container { padding: 1.5rem; }
                }
            `}</style>

            <section className="hero">
                <div className="animate-fade-in">
                    <div className="badge-247">Integrated Architecture 2.0</div>
                    <h1>Dr. Tooth Dental</h1>
                    <p>The Future of Precision Practice Management. A unified ecosystem connecting patients, doctors, and data seamlessly.</p>
                </div>
            </section>

            <section className="container">
                <div className="section-title">
                    <h2>System Architecture Flow</h2>
                    <p>End-to-end data lifecycle from landing page to real-time notification.</p>
                </div>
                <div className="diagram-container">
                    <div className="mermaid">
                        {`graph TD
                        %% User/Patient Path
                        User((Patient)) -->|Lands on| Hero[Next.js Homepage]
                        Hero -->|Browses| Blogs[Blog System/Insights]
                        Hero -->|Authenticates| GoogleAuth[NextAuth Google Login]
                        GoogleAuth -->|Creates/Updates| DB[(MongoDB)]

                        %% Booking Flow
                        User -->|Clicks| Book[Booking Form]
                        Book -->|POST /api/appointments| API[Express API]
                        API -->|Saves| DB
                        API -->|Emits 'newAppointment'| Socket[Socket.io Server]
                        Socket -->|Real-time Notify| Admin[Admin Dashboard]

                        %% Admin Flow
                        Admin -->|Views/Updates Status| Manage[Admin Schedule Manager]
                        Manage -->|PUT /api/appointments/:id| API
                        API -->|Updates| DB
                        API -->|Trigger Notification| NotifyService[Notification Service]

                        %% Notification Loop
                        NotifyService -->|WhatsApp Link| WhatsApp[WhatsApp Messenger]
                        NotifyService -->|Email Confirmation| Mailgun[Mailgun Service]
                        NotifyService -->|Socket 'statusUpdate'| UserHome[User Profile]

                        style Hero fill:#1e293b,stroke:#2563eb,stroke-width:2px,color:#fff
                        style Admin fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
                        style DB fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
                        style Socket fill:#4338ca,stroke:#6366f1,color:#fff`}
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="section-title">
                    <h2>Clinic Operational Workflow</h2>
                    <p>Managing the patient experience from arrival to financial settlement.</p>
                </div>
                <div className="diagram-container">
                    <div className="mermaid">
                        {`graph TD
                        Dashboard[Admin Dashboard] -->|Real-time Alert| NewApt[New Appointment Notification]
                        NewApt -->|Socket.io| DashTable[Clinic Schedule Table]

                        DashTable -->|Click Patient| Profile[Patient Digital Profile]
                        Profile -->|View| History[Medical History & Past Treatments]
                        Profile -->|Update| HealthData[Clinical Notes & Update Vitals]

                        HealthData -->|Start Session| Record[Treatment Record Entry]
                        Record -->|Select Treatment| Procedure[Procedure Details & Pricing]
                        Procedure -->|Save| Ledger[Patient Financial Ledger]

                        Ledger -->|Generate| WhatsAppMsg[WhatsApp Care Instructions]
                        WhatsAppMsg -->|Link| PatientPhone[Patient WhatsApp]

                        Ledger -->|Sync| Stats[Clinic Analytics: Revenue & Traffic]

                        style Dashboard fill:#1e3a8a,color:#fff
                        style Profile fill:#1e293b,stroke:#2563eb
                        style Ledger fill:#1e293b,stroke:#f59e0b
                        style WhatsAppMsg fill:#064e3b,stroke:#10b981`}
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="section-title">
                    <h2>Manual Chaos vs. Robotic Precision</h2>
                    <p>How automation eliminates human error and latency.</p>
                </div>
                <div className="comparison">
                    <div className="comp-box comp-old">
                        <span className="comp-title" style={{ color: '#ef4444' }}>Traditional Handling</span>
                        <div className="comp-item">Paper-based patient records causing retrieval latency</div>
                        <div className="comp-item">Manual call-backs for scheduling</div>
                        <div className="comp-item">Zero real-time visibility into traffic or collection</div>
                        <div className="comp-item">Website updates require developer help</div>
                        <div className="comp-item">Manual WhatsApp messaging loop</div>
                    </div>
                    <div className="comp-box comp-new">
                        <span className="comp-title" style={{ color: '#10b981' }}>Dr. Tooth Automation</span>
                        <div className="comp-item">✅ Digital Patient SSOT (Instant Access)</div>
                        <div className="comp-item">✅ Real-time Socket.io Appointment Notifications</div>
                        <div className="comp-item">✅ Automated Data-driven Financial Analytics</div>
                        <div className="comp-item">✅ Self-Editable Site Content & SEO Control</div>
                        <div className="comp-item">✅ 24/7 Automated Inquiry & WhatsApp Sync</div>
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="section-title">
                    <h2>Why Digital? Why Now?</h2>
                    <p>The critical shift from "Staff-Managed" to "System-Empowered" clinics.</p>
                </div>
                <div className="faq-grid">
                    <div className="faq-item">
                        <div className="faq-q"><span>❓</span> If I have staff, why need a website?</div>
                        <div className="faq-a">Staff sleep; your website doesn't. 70% of dental searches happen after 6 PM. If a patient finds a manual search form that "waits for a callback," they leave. Dr. Tooth provides instant authentication and real-time booking, securing the patient before they click your competitor.</div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-q"><span>❓</span> Is a Google Form not enough?</div>
                        <div className="faq-a">Google Forms are data silos. They don't check doctor availability, they don't sync with medical history, and they don't send automated WhatsApp care instructions. Dr. Tooth is an SSOT (Single Source of Truth) where booking, billing, and treatment history live in one pulse.</div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-q"><span>❓</span> How does this help the Doctors?</div>
                        <div className="faq-a">Instead of staff shouting names or shuffling papers, doctors see a Live Queue Dashboard. One click opens a patient's entire medical history, previous X-rays, and allergy alerts. This reduces "Human Error Latency" by 95%.</div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-q"><span>❓</span> What about SEO and Growth?</div>
                        <div className="faq-a">Static sites die in Google rankings. Our Dynamic Content Control lets you update meta-tags and treatment keywords instantly. When you add a "New Laser Surgery" in your dashboard, Google indexes it as a fresh update immediately.</div>
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="section-title">
                    <h2>Technical Supremacy: The Core Stack</h2>
                    <p>Rated for reliability, scalability, and future-proof performance.</p>
                </div>
                <div className="grid">
                    <div className="card">
                        <div className="card-icon">⚛️</div>
                        <h3>Next.js 16.1 / React 19</h3>
                        <p>The bleeding edge of web performance. Utilizing RSC and a compiler-driven architecture for negligible latency.</p>
                        <div className="tech-stats">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
                                <span>Reliability: ⭐⭐⭐⭐⭐</span>
                                <span>Future: 100%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem' }}>
                                <div style={{ width: '98%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="tech-stack">Advancement: React Compiler + Server Components</div>
                    </div>
                    <div className="card">
                        <div className="card-icon">🛡️</div>
                        <h3>Express 5.2 / Node 22</h3>
                        <p>High-frequency backend system handling real-time CRUD operations with simplified promise handling.</p>
                        <div className="tech-stats">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
                                <span>Reliability: ⭐⭐⭐⭐⭐</span>
                                <span>Future: 95%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem' }}>
                                <div style={{ width: '95%', height: '100%', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="tech-stack">Advancement: Native Async/Await Middleware Support</div>
                    </div>
                    <div className="card">
                        <div className="card-icon">�</div>
                        <h3>MongoDB / Mongoose 9.2</h3>
                        <p>Elastically scalable data layer with deep TypeScript integration and optimized aggregation pipelines.</p>
                        <div className="tech-stats">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
                                <span>Reliability: ⭐⭐⭐⭐⭐</span>
                                <span>Future: 98%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem' }}>
                                <div style={{ width: '98%', height: '100%', background: 'var(--accent)', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="tech-stack">Advancement: Schema Invalidation + Type-Safe Queries</div>
                    </div>
                    <div className="card">
                        <div className="card-icon">⚡</div>
                        <h3>Socket.io 4.8</h3>
                        <p>Bidirectional event streams for instant notifications, ensuring no patient inquiry is ever missed.</p>
                        <div className="tech-stats">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
                                <span>Reliability: ⭐⭐⭐⭐⭐</span>
                                <span>Future: 90%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem' }}>
                                <div style={{ width: '92%', height: '100%', background: 'var(--primary-light)', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="tech-stack">Advancement: Binary Payload Optimization</div>
                    </div>
                </div>
            </section>

            <footer className="text-center p-16 text-[#94a3b8] text-[0.8rem] border-t border-[rgba(255,255,255,0.1)]">
                © 2026 Dr. Tooth Dental Clinic | Built for Excellence | Powered by Next.js & Express
            </footer>
        </div>
    );
}
