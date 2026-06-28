import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/15550000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/40 transition-colors"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="button-whatsapp-sticky"
      aria-label="Chat on WhatsApp"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-20" />
        <MessageCircle className="w-6 h-6 fill-white stroke-none" />
      </span>
      <span className="pr-5 font-semibold text-sm hidden sm:block">Chat on WhatsApp</span>
    </motion.a>
  );
}
