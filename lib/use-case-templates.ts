/**
 * Use-case templates for new users
 * Preset scripts for different speech scenarios
 */

export interface UseCaseTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'technical' | 'presentation' | 'interview'
  script: string
  tips: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // in seconds
  icon: string
}

export const useCaseTemplates: UseCaseTemplate[] = [
  {
    id: 'elevator-pitch',
    name: 'Elevator Pitch',
    description: 'A quick 30-60 second introduction about yourself or your idea',
    category: 'business',
    script: `Hi, I'm [Name]. I specialize in [field/expertise]. I help [target audience] solve [problem] by [your approach]. I've worked with companies like [examples], and my latest project resulted in [metric/achievement]. If you're interested in discussing how we might work together, I'd love to grab coffee.`,
    tips: [
      'Keep it concise and impactful',
      'Use specific numbers and results',
      'Practice pacing—aim for 110-150 WPM',
      'Make eye contact and smile',
    ],
    difficulty: 'beginner',
    estimatedDuration: 45,
    icon: '🎯',
  },

  {
    id: 'technical-intro',
    name: 'Technical Interview Introduction',
    description: 'Professional intro for technical interviews or presentations',
    category: 'technical',
    script: `My name is [Name], and I have [X] years of experience in [technologies/domain]. My background includes building scalable systems at [company], where I led a team of [number] engineers. Key projects include [project 1] which improved performance by [metric], and [project 2] which shipped to [number] users. I'm passionate about clean architecture and mentoring junior developers. I'm particularly excited about [technology/domain] because it solves [problem].`,
    tips: [
      'Quantify your achievements with specific metrics',
      "Mention technologies you're proficient in early",
      'Show enthusiasm for the domain',
      'Keep technical jargon clear and accessible',
    ],
    difficulty: 'intermediate',
    estimatedDuration: 60,
    icon: '💻',
  },

  {
    id: 'keynote-opening',
    name: 'Keynote Opening',
    description: 'Engaging opening for a presentation or conference talk',
    category: 'presentation',
    script: `Good morning, everyone. A few months ago, I faced a challenge that changed how I think about [topic]. [Brief relevant story or statistic]. That experience taught me three critical lessons that I want to share with you today. First, [key point 1]. Second, [key point 2]. Third, [key point 3]. By the end of this session, you'll understand why [topic] matters and how to [actionable outcome]. So let's dive in.`,
    tips: [
      'Start with a hook—story, question, or surprising stat',
      'Clearly outline what audience will learn',
      'Use the "rule of three" (three main points)',
      'Vary your pace to maintain engagement',
    ],
    difficulty: 'intermediate',
    estimatedDuration: 90,
    icon: '🎤',
  },

  {
    id: 'job-interview',
    name: 'Job Interview Response: "Tell me about yourself"',
    description: 'Common interview question response, structured and compelling',
    category: 'interview',
    script: `Thanks for asking. I'm [Name], and I bring [X] years of [domain] experience. My career started at [company 1], where I [achievement]. I then moved to [company 2], where I led [project] and increased [metric] by [percentage]. My expertise spans [skill 1], [skill 2], and [skill 3]. What drives me most is [motivation], and I'm excited about this role because your company is [specific reason]. I believe my background in [relevant experience] makes me well-suited to contribute immediately.`,
    tips: [
      'Be specific with numbers and achievements',
      'Align your background with job requirements',
      'Show genuine interest in the company',
      'Practice to land in 60-90 seconds',
    ],
    difficulty: 'beginner',
    estimatedDuration: 75,
    icon: '👔',
  },

  {
    id: 'product-pitch',
    name: 'Product Pitch (Investor)',
    description: 'Compelling pitch for investors or stakeholders',
    category: 'business',
    script: `We're solving a [billion/million]-dollar problem that affects [number] people globally. [Problem explanation with example]. Existing solutions like [competitor] fall short because [limitation]. Our approach is different. [Product/solution + unique value proposition]. We've validated demand with [evidence: beta users, pre-orders, etc.]. Our team includes [key expertise]. We're raising [amount] to [use of funds]. And our financial projections show [metric] by [timeline]. At scale, this could generate [potential revenue] in value.`,
    tips: [
      'Lead with the problem, not the solution',
      'Validate traction with real metrics',
      'Be clear on how you\'re different',
      'Practice to fit 2-3 minutes',
    ],
    difficulty: 'advanced',
    estimatedDuration: 180,
    icon: '📊',
  },

  {
    id: 'sales-pitch',
    name: 'Sales Pitch (Product Demo)',
    description: 'Sales pitch that explains product benefits and closes',
    category: 'business',
    script: `Thanks for taking the time. I know you're busy, so I'll be brief. You mentioned [customer pain point]. That's actually our core focus. [Product] solves this by [key benefit]. For example, [customer name] went from [old metric] to [new metric] in [timeframe]. The best part? It integrates seamlessly with your [existing tool]. Many of our clients see ROI within [timeframe]. What if I show you exactly how it would work for your [specific use case]?`,
    tips: [
      'Personalize to the prospect\'s stated challenge',
      'Lead with customer success stories',
      'Use specific metrics and timelines',
      'End with a clear next step',
    ],
    difficulty: 'intermediate',
    estimatedDuration: 120,
    icon: '💰',
  },
]

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: UseCaseTemplate['category']): UseCaseTemplate[] {
  return useCaseTemplates.filter((t) => t.category === category)
}

/**
 * Get all categories
 */
export function getAllCategories(): UseCaseTemplate['category'][] {
  const categories = new Set(useCaseTemplates.map((t) => t.category))
  return Array.from(categories)
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): UseCaseTemplate | undefined {
  return useCaseTemplates.find((t) => t.id === id)
}
