import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Variety Streamer",
    platform: "Twitch Partner",
    quote: "TriggerHub saved me 2+ hours every stream. My scene transitions, music, and alerts all run automatically now. I can focus 100% on my audience.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "FPS Content Creator",
    platform: "YouTube Gaming",
    quote: "The clip automation is insane. Chat can trigger clips with commands, they're saved locally AND sent to my editor automatically. Complete game-changer.",
    rating: 5,
  },
  {
    name: "Emma Taylor",
    role: "Just Chatting Streamer",
    platform: "Kick Creator",
    quote: "I'm not technical at all, but TriggerHub's visual editor made sense immediately. Copy a template, customize it, done. Feels like magic.",
    rating: 5,
  },
  {
    name: "Alex Kim",
    role: "Music Producer",
    platform: "Multi-platform",
    quote: "Syncing Philips Hue lights with my scenes creates such an immersive vibe. Viewers always ask how I do it. It's literally 3 nodes in TriggerHub.",
    rating: 5,
  },
  {
    name: "Jordan Blake",
    role: "Speedrunner",
    platform: "Twitch Affiliate",
    quote: "Discord notifications when I go live, automatic intro music, scene switches on timer—all running in the background. My streams feel so professional now.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Art Streamer",
    platform: "YouTube Creator",
    quote: "The Stream Deck integration is perfect. One button press triggers my entire stream start routine. Music, lights, scenes, notifications—all automated.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-sky-500 font-semibold mb-3 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by creators worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of streamers automating their workflows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-zinc-950/50 border border-white/10 hover:border-sky-500/20 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold mb-0.5">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-xs text-sky-400 mt-1">{testimonial.platform}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="size-4 text-sky-400 fill-sky-400" />
                ))}
              </div>

              <div className="relative">
                <Quote className="size-8 text-sky-500/20 absolute -top-2 -left-2" />
                <p className="text-gray-300 leading-relaxed pl-6">
                  {testimonial.quote}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Trusted by <span className="text-sky-400 font-semibold">3,000+ creators</span> across Twitch, YouTube, and Kick
          </p>
        </motion.div>
      </div>
    </section>
  );
}
