'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getApiBase } from '@/lib/api'

interface Job {
  _id: string
  title: string
  department?: string
  location?: string
  jobType?: string
  salary?: {
    min?: number
    max?: number
    currency?: string
  }
  description: string
  requirements?: string[]
  deadline?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const API_BASE = getApiBase()
        const res = await fetch(`${API_BASE}/api/jobs?limit=50`)
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        setJobs(Array.isArray(data?.jobs) ? data.jobs : [])
      } catch (error) {
        console.error(error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  const formatSalary = (job: Job) => {
    const min = job.salary?.min
    const max = job.salary?.max
    const currency = job.salary?.currency || 'KES'
    if (typeof min === 'number' && typeof max === 'number') return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (typeof min === 'number') return `${currency} ${min.toLocaleString()}+`
    return 'Salary negotiable'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground">Exciting career opportunities at AsterMed</p>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <Card className="p-8 text-muted-foreground">Loading careers...</Card>
        ) : jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job._id} className="p-8 border-none shadow-md hover:shadow-lg transition">
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                  <p className="text-muted-foreground mb-4">{job.department || 'General'}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                      {job.location || 'Location to be shared'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-accent" />
                      {job.jobType || 'Full-time'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-accent" />
                      {formatSalary(job)}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deadline to apply:</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}</span>
                    </div>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 mt-4">Apply Now</Button>
                </div>
              </div>

              <div className="mb-6 pb-6 border-t">
                <p className="text-muted-foreground mb-4">{job.description}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  {(job.requirements || []).map((req, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="text-accent font-bold">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-muted-foreground">No career openings are published at the moment.</Card>
        )}
      </main>

      <Footer />
    </div>
  )
}
