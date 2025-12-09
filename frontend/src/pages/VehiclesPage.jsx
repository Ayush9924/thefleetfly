import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
        <p className="text-gray-500">Manage your fleet vehicles</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

