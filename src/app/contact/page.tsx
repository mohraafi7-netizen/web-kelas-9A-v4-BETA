import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata = {
  title: 'Contact - Galaxy Class',
  description: 'Get in touch with Galaxy Class.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Section title="Contact Us" subtitle="We'd love to hear from you.">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Mail, title: 'Email', value: 'galaxyclass@example.com' },
            { icon: Phone, title: 'Phone', value: '+62 812 3456 7890' },
            { icon: MapPin, title: 'Address', value: 'SMA Negeri 1 Example' },
          ].map((item) => (
            <GlassCard key={item.title} hover className="p-6 text-center group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-galaxy-400" />
              </div>
              <h3 className="font-semibold mb-1 text-white">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.value}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
    </main>
  );
}
