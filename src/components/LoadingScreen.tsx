'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  const circleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const textVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="relative">
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99]
          }}
          className="relative text-center"
        >
          <motion.div
            variants={circleVariants}
            animate="animate"
            className="w-24 h-24 mb-8 mx-auto"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <motion.div
                    animate={{
                      background: [
                        "linear-gradient(0deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                        "linear-gradient(360deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-full h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <motion.h2
              variants={textVariants}
              animate="animate"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
            >
              CLASH ID Cloud
            </motion.h2>
            
            <motion.div 
              className="flex justify-center space-x-1"
              animate={{
                transition: {
                  staggerChildren: 0.2
                }
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: ["0%", "-50%", "0%"]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
