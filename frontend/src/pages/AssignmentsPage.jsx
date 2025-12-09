import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-gray-500">Manage vehicle and driver assignments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

