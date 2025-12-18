import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';

const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 border-t border-sage/20 bg-charcoal">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-7xl text-sage mb-12"
        >
          Get in Touch
        </motion.h2>

        <div className="flex justify-center gap-8 mb-16">
          {[
            { icon: Mail, href: "mailto:qbacquele@gmail.com" },
            { icon: Github, href: "https://github.com/quentinbacquele" },
            { icon: Linkedin, href: "https://www.linkedin.com/in/quentin-bacquel%C3%A9-74a462226/" },
            { icon: Twitter, href: "https://x.com/QBacquele" },
            { icon: BlueskyIcon, href: "https://bsky.app/profile/quentinbacquele.bsky.social" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              target={item.icon === Mail ? undefined : "_blank"}
              rel={item.icon === Mail ? undefined : "noopener noreferrer"}
              whileHover={{ scale: 1.1, color: '#f6a341' }}
              className="p-4 rounded-full bg-sage/10 text-sand transition-colors hover:bg-sage/20"
            >
              <item.icon className="w-6 h-6" />
            </motion.a>
          ))}
        </div>

        <div className="font-mono text-xs text-sage/60 uppercase tracking-widest">
          © {new Date().getFullYear()} Quentin Bacquelé. All Rights Reserved.
        </div>
      </div>
    </section>
  );
}
