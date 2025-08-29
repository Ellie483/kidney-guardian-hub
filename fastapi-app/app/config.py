import os

# You can store this in an env var later for security
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://lynnkhant:dfXOCnB2dZZ9cGmX@cluster0.wqyif61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = "Kidney"  # Or whatever database you create in Atlas
