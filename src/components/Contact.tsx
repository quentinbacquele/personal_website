import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';

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
          Let's Collaborate
        </motion.h2>

        <div className="flex justify-center gap-8 mb-16">
          {[
            { icon: Mail, href: "mailto:hello@example.com" },
            { icon: Github, href: "https://github.com" },
            { icon: Twitter, href: "https://twitter.com" },
            { icon: Linkedin, href: "https://linkedin.com" },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
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
