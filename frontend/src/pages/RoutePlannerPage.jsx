import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function RoutePlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
        <p className="text-gray-500">Plan and manage delivery routes</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Route Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

