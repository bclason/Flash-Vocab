#!/bin/bash
cd backend
exec gunicorn --bind 0.0.0.0:$PORT app:app