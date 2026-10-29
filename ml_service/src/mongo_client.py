"""
PyMongo Database Client for FleetFly Fuel Intelligence.
Demonstrates:
1. Connecting via PyMongo with URI loaded from environment variables.
2. Reading existing 'vehicles' and 'fuellogs'.
3. Inserting evaluation metrics into 'ml_model_metrics' and predictions into 'prediction_logs'.
4. Querying documents with filters.
5. Updating documents.
6. Safe deletion in an isolated sandbox collection ('ml_demo_sandbox'), NEVER touching real fleet data.
7. MongoDB Aggregation Pipeline: Grouping fuel logs by vehicle, calculating total liters and expenditure.
8. Creating query indexes for optimized performance.
"""
import os
import sys
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, PyMongoError

from .config import MONGODB_URI, DB_NAME, ML_MODE

class FleetFlyMongoClient:
    def __init__(self, uri=None, db_name=None):
        self.uri = uri or MONGODB_URI
        self.db_name = db_name or DB_NAME
        self.client = None
        self.db = None
        self.is_connected = False
        self._init_connection()

    def _init_connection(self):
        try:
            # Mask credentials in logs for security
            masked_uri = self.uri
            if "@" in masked_uri:
                protocol = masked_uri.split("://")[0]
                host_part = masked_uri.split("@")[-1]
                masked_uri = f"{protocol}://***:***@{host_part}"
            
            print(f"[PyMongo] Connecting to MongoDB: {masked_uri}")
            self.client = MongoClient(
                self.uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            # Verify server is responsive
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.is_connected = True
            print(f"[PyMongo] Successfully connected to database: '{self.db_name}'")
        except (ConnectionFailure, PyMongoError) as e:
            print(f"[PyMongo] Warning: Could not connect to remote MongoDB: {e}")
            print(f"[PyMongo] Running in Local Demo Mode.")
            self.is_connected = False
            self.client = None
            self.db = None

    # 1. READ: Existing vehicles
    def get_vehicles(self, filter_query=None):
        if not self.is_connected:
            return [
                {"_id": "demo_v1", "plateNumber": "FL-101", "make": "Toyota", "model": "Corolla", "year": 2021, "status": "active"},
                {"_id": "demo_v2", "plateNumber": "FL-102", "make": "Ford", "model": "Transit", "year": 2020, "status": "active"},
                {"_id": "demo_v3", "plateNumber": "FL-103", "make": "Volvo", "model": "FH16", "year": 2022, "status": "active"}
            ]
        try:
            return list(self.db.vehicles.find(filter_query or {}))
        except Exception as e:
            print(f"[PyMongo Error] get_vehicles: {e}")
            return []

    # 2. READ: Existing fuel logs
    def get_fuel_logs(self, vehicle_id=None):
        if not self.is_connected:
            return []
        try:
            query = {"vehicle": vehicle_id} if vehicle_id else {}
            return list(self.db.fuellogs.find(query).sort("date", ASCENDING))
        except Exception as e:
            print(f"[PyMongo Error] get_fuel_logs: {e}")
            return []

    # 3. CREATE / INSERT: Evaluation Metrics
    def save_evaluation_metrics(self, metrics_payload):
        """Stores model evaluation metrics in 'ml_model_metrics' collection."""
        record = {
            **metrics_payload,
            "created_at": datetime.utcnow(),
            "source": "FleetFly Fuel Intelligence ML Pipeline"
        }
        if not self.is_connected:
            print("[PyMongo Demo] Simulation: evaluation metrics saved to local state.")
            return "simulated_metrics_id"
        try:
            result = self.db.ml_model_metrics.insert_one(record)
            print(f"[PyMongo] Inserted evaluation metrics record ID: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            print(f"[PyMongo Error] save_evaluation_metrics: {e}")
            return None

    # 4. CREATE / INSERT: Prediction Log
    def log_prediction(self, prediction_data):
        """Inserts an individual vehicle prediction into 'prediction_logs'."""
        record = {
            **prediction_data,
            "createdAt": datetime.utcnow()
        }
        if not self.is_connected:
            print(f"[PyMongo Demo] Simulated prediction logged: {record.get('predicted_mpg')} MPG")
            return "simulated_pred_id"
        try:
            res = self.db.prediction_logs.insert_one(record)
            return str(res.inserted_id)
        except Exception as e:
            print(f"[PyMongo Error] log_prediction: {e}")
            return None

    # 5. READ WITH FILTERS: Retrieve saved predictions
    def get_prediction_history(self, limit=10, min_mpg=None):
        """Retrieve saved prediction records with query filtering."""
        if not self.is_connected:
            return []
        try:
            filter_q = {}
            if min_mpg is not None:
                filter_q["predicted_mpg"] = {"$gte": float(min_mpg)}
            cursor = self.db.prediction_logs.find(filter_q).sort("createdAt", DESCENDING).limit(limit)
            return list(cursor)
        except Exception as e:
            print(f"[PyMongo Error] get_prediction_history: {e}")
            return []

    # 6. UPDATE: Update a prediction note or metadata
    def update_prediction_note(self, prediction_id, note):
        """Demonstrates update_one on a prediction document."""
        if not self.is_connected:
            print(f"[PyMongo Demo] Simulated update for ID {prediction_id}")
            return True
        try:
            from bson import ObjectId
            _id = ObjectId(prediction_id) if isinstance(prediction_id, str) and len(prediction_id) == 24 else prediction_id
            res = self.db.prediction_logs.update_one(
                {"_id": _id},
                {"$set": {"user_notes": note, "updatedAt": datetime.utcnow()}}
            )
            return res.modified_count > 0
        except Exception as e:
            print(f"[PyMongo Error] update_prediction_note: {e}")
            return False

    # 7. SAFE DELETE: In an isolated demo collection only
    def demonstrate_safe_delete(self):
        """
        Safely demonstrates PyMongo delete_one / delete_many operations.
        NEVER touches real FleetFly collections ('vehicles', 'fuellogs', etc.).
        Operates strictly within 'ml_demo_sandbox'.
        """
        if not self.is_connected:
            print("[PyMongo Demo] Simulated safe delete demonstration successful.")
            return {"inserted": 1, "deleted": 1}
        try:
            sandbox = self.db.ml_demo_sandbox
            # Insert a temporary test token
            temp_doc = {
                "sandbox_test": True,
                "purpose": "Academic assignment PyMongo DELETE verification",
                "timestamp": datetime.utcnow()
            }
            ins_res = sandbox.insert_one(temp_doc)
            print(f"[PyMongo Safe Delete] Created temporary sandbox doc ID: {ins_res.inserted_id}")

            # Safely delete the document
            del_res = sandbox.delete_one({"_id": ins_res.inserted_id})
            print(f"[PyMongo Safe Delete] Successfully deleted {del_res.deleted_count} doc(s) from 'ml_demo_sandbox'.")
            return {"inserted_id": str(ins_res.inserted_id), "deleted_count": del_res.deleted_count}
        except Exception as e:
            print(f"[PyMongo Error] demonstrate_safe_delete: {e}")
            return None

    # 8. AGGREGATION PIPELINE: Meaningful fuel aggregation by vehicle
    def aggregate_fuel_stats(self):
        """
        Executes a multi-stage MongoDB Aggregation Pipeline:
        1. $match: filter valid fuel logs (liters > 0, cost > 0).
        2. $group: group by vehicle, sum liters & expenditure, count logs, track odometer span.
        3. $lookup: join with 'vehicles' collection for vehicle plate number and model.
        4. $project: calculate distance traveled and average fuel economy.
        """
        if not self.is_connected:
            # Return realistic demo calculation
            return [
                {
                    "vehicleId": "demo_v1",
                    "plateNumber": "FL-101",
                    "make": "Toyota",
                    "model": "Corolla",
                    "totalLiters": 180.5,
                    "totalCost": 270.75,
                    "recordsCount": 4,
                    "distanceTraveled": 2420,
                    "fuelEfficiencyKmPerLiter": round(2420 / 180.5, 2),
                    "costPerKm": round(270.75 / 2420, 2),
                    "isDemo": True
                }
            ]
        try:
            pipeline = [
                {
                    "$match": {
                        "liters": {"$gt": 0},
                        "cost": {"$gt": 0}
                    }
                },
                {
                    "$group": {
                        "_id": "$vehicle",
                        "totalLiters": {"$sum": "$liters"},
                        "totalCost": {"$sum": "$cost"},
                        "recordsCount": {"$sum": 1},
                        "minOdometer": {"$min": "$odometer"},
                        "maxOdometer": {"$max": "$odometer"}
                    }
                },
                {
                    "$lookup": {
                        "from": "vehicles",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "vehicleDetails"
                    }
                },
                {
                    "$unwind": {
                        "path": "$vehicleDetails",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "vehicleId": "$_id",
                        "plateNumber": {"$ifNull": ["$vehicleDetails.plateNumber", "Unknown"]},
                        "make": {"$ifNull": ["$vehicleDetails.make", "N/A"]},
                        "model": {"$ifNull": ["$vehicleDetails.model", "N/A"]},
                        "totalLiters": {"$round": ["$totalLiters", 2]},
                        "totalCost": {"$round": ["$totalCost", 2]},
                        "recordsCount": 1,
                        "distanceTraveled": {"$subtract": ["$maxOdometer", "$minOdometer"]},
                        "avgCostPerLiter": {
                            "$cond": [
                                {"$gt": ["$totalLiters", 0]},
                                {"$round": [{"$divide": ["$totalCost", "$totalLiters"]}, 2]},
                                0
                            ]
                        }
                    }
                }
            ]
            results = list(self.db.fuellogs.aggregate(pipeline))
            
            # Post-calculate km per liter where distance > 0
            for r in results:
                dist = r.get("distanceTraveled", 0)
                liters = r.get("totalLiters", 0)
                cost = r.get("totalCost", 0)
                r["fuelEfficiencyKmPerLiter"] = round(dist / liters, 2) if (liters > 0 and dist > 0) else None
                r["costPerKm"] = round(cost / dist, 2) if dist > 0 else None
                r["isDemo"] = False
            return results
        except Exception as e:
            print(f"[PyMongo Error] aggregate_fuel_stats: {e}")
            return []

    # 9. INDEX MANAGEMENT
    def create_indexes(self):
        """Ensures query indexes exist on frequently accessed collections."""
        if not self.is_connected:
            return
        try:
            # Index on prediction_logs for fast chronological queries
            self.db.prediction_logs.create_index([("createdAt", DESCENDING)])
            self.db.prediction_logs.create_index([("predicted_mpg", ASCENDING)])
            # Index on ml_model_metrics
            self.db.ml_model_metrics.create_index([("created_at", DESCENDING)])
            print("[PyMongo] Ensured indexes on 'prediction_logs' and 'ml_model_metrics'.")
        except Exception as e:
            print(f"[PyMongo Error] create_indexes: {e}")

# Global singleton client
mongo_client = FleetFlyMongoClient()

