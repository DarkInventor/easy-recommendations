'use client'

import { useState, useEffect } from 'react'
import { templates, Template } from '../data/templates'
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader, Layout, Columns, Box, ArrowRight } from 'lucide-react'
import ProofSection from './ProofSection'
import ShimmerButton from "@/components/ui/shimmer-button"
import PulsatingButton from "@/components/ui/pulsating-button"
import Image from 'next/image'

export default function TemplateRecommender() {
  const [searchTerm, setSearchTerm] = useState('')
  const [recommendations, setRecommendations] = useState<Template[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'sections'>('all')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm) {
        recommendTemplates()
      } else {
        // Show random recommendations when there's no search term
        const randomRecommendations = getFilteredTemplates()
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setRecommendations(randomRecommendations)
      }
    }, 300)

    return () => clearTimeout(debounce)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeTab])

  const getFilteredTemplates = () => {
    return templates.filter(template => {
      if (activeTab === 'all') return true;
      if (activeTab === 'templates') return template.type === 'template';
      if (activeTab === 'sections') return template.type === 'section';
      return false;
    });
  }

  const recommendTemplates = () => {
    setIsSearching(true)
    const scoredTemplates = getFilteredTemplates()
      .map(template => {
        let score = 0;
        const searchLower = searchTerm.toLowerCase();
        
        if (template.name.toLowerCase().includes(searchLower)) {
          score += 3;
        }
        if (template.type.toLowerCase().includes(searchLower)) {
          score += 2;
        }
        if (template.description.toLowerCase().includes(searchLower)) {
          score += 4;
        }

        return { ...template, score };
      });

    const sortedTemplates = scoredTemplates
      .filter(template => template.score > 0)
      .sort((a, b) => b.score - a.score);

    let finalRecommendations = sortedTemplates.slice(0, 6);

    // If we don't have enough recommendations, add random ones
    if (finalRecommendations.length < 6) {
      const remainingCount = 6 - finalRecommendations.length;
      const randomTemplates = getFilteredTemplates()
        .filter(t => !finalRecommendations.some(r => r.name === t.name))
        .sort(() => 0.5 - Math.random())
        .slice(0, remainingCount);
      // @ts-expect-error ignore this please
      finalRecommendations = [...finalRecommendations, ...randomTemplates];
    }

    setTimeout(() => {
      setRecommendations(finalRecommendations)
      setIsSearching(false)
    }, 500)
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <Image
              src="https://pub-0cd6f9d4131f4f79ac40219248ae64db.r2.dev/logo.svg"
              alt="Easy UI Logo"
              width={40}
              height={40}
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900">
            Discover Your Perfect UI
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find the ideal template or section to <span className='bg-black text-white leading-7 tracking-tight px-3 py-1 rounded-full font-normal text-[20px]'>kickstart</span> your next project
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="What kind of UI are you looking for? (e.g., modern landing page, blog, SaaS dashboard)"
                className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-300 text-base sm:text-lg"
                aria-label="Search for UI templates and sections"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as 'all' | 'templates' | 'sections')}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-4">
              <TabsTrigger value="all" className="flex items-center justify-center">
                <Layout className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center justify-center">
                <Box className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center justify-center">
                <Columns className="w-4 h-4 mr-2" />
                Sections
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center mt-8"
            >
              <Loader className="animate-spin text-blue-600" />
              <span className="ml-2 text-blue-600">Curating the perfect UI elements for you...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 flex justify-center">
                {searchTerm ? 'Tailored Recommendations' : 'Featured Templates and Sections'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((template, index) => (
                  <motion.div
                    key={template.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-200 overflow-hidden">
                      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardTitle className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-800">{template.name}</span>
                          <Badge variant={template.type === 'template' ? 'default' : 'secondary'} className="text-xs rounded-full px-2 py-1">
                            {template.type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow pt-2">
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-gray-100 flex justify-between">
                        <ShimmerButton
                        // @ts-expect-error ignore this please
                          href={template.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white"
                        >
                          Explore {template.type === 'template' ? 'Template' : 'Section'}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </ShimmerButton>
                        {template.type === 'template' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <PulsatingButton onClick={() => handlePreview(template)}>
                                Preview
                              </PulsatingButton>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-11/12">
                              <DialogHeader>
                                <DialogTitle>{template.name} Preview</DialogTitle>
                                <DialogDescription>
                                  Template video preview
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4">
                                <video
                                  src={template.videoUrl}
                                  controls
                                  className="w-full rounded-md"
                                  autoPlay
                                  loop
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proof Section */}
        <ProofSection />
      </div>
    </div>
  )
}

