import { Card } from "@/components/ui/card";
import { Brain, Users, Trophy, Zap, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Advanced AI",
    description: "Challenge intelligent opponents that adapt to your skill level",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Multiplayer",
    description: "Play with friends online or compete against players worldwide",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "Unlock rewards and track your progress as you improve",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Real-time Action",
    description: "Experience smooth, responsive gameplay with zero lag",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Target,
    title: "Training Mode",
    description: "Learn strategies and tactics with guided tutorials",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Beautiful Design",
    description: "Enjoy stunning 3D graphics and customizable themes",
    color: "from-indigo-500 to-purple-500",
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">Dekolzee Chess</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Packed with features designed to elevate your chess experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="glass-panel p-6 h-full hover:border-primary/50 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
