# Django+MongoDB后端配置示例

## requirements.txt 示例
```txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
mongoengine==0.27.0
djongo==1.3.6
drf-yasg==1.21.7
Pillow==10.1.0
celery==5.3.4
redis==5.0.1
python-decouple==3.8
gunicorn==21.2.0
```

## settings/base.py 示例
```python
import os
from decouple import config
from datetime import timedelta

# 基础配置
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SECRET_KEY = config('SECRET_KEY', default='your-secret-key')
DEBUG = config('DEBUG', default=False, cast=bool)

# 应用配置
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
]

LOCAL_APPS = [
    'apps.authentication',
    'apps.products',
    'apps.inventory',
    'apps.inbound',
    'apps.outbound',
    'apps.quality',
    'apps.reports',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# 中间件
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# 数据库配置 (MongoDB)
import mongoengine
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': config('MONGO_DB_NAME', default='wms_database'),
    }
}

# MongoDB连接
mongoengine.connect(
    db=config('MONGO_DB_NAME', default='wms_database'),
    host=config('MONGO_HOST', default='localhost'),
    port=config('MONGO_PORT', default=27017, cast=int),
    username=config('MONGO_USERNAME', default=''),
    password=config('MONGO_PASSWORD', default=''),
)

# Django REST Framework配置
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.CustomPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

# JWT配置
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# 文件上传配置
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# 国际化
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

# 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## urls.py 示例
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger文档配置
schema_view = get_schema_view(
    openapi.Info(
        title="小神龙WMS API",
        default_version='v1',
        description="仓库管理系统API文档",
        contact=openapi.Contact(email="admin@wms.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API路由
    path('api/auth/', include('apps.authentication.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/inbound/', include('apps.inbound.urls')),
    path('api/outbound/', include('apps.outbound.urls')),
    path('api/quality/', include('apps.quality.urls')),
    path('api/reports/', include('apps.reports.urls')),
    
    # API文档
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# 开发环境下的媒体文件服务
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Docker配置示例

### Dockerfile
```dockerfile
FROM python:3.9

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: mongo:5.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: wms_user
      MONGO_INITDB_ROOT_PASSWORD: wms_password
      MONGO_INITDB_DATABASE: wms_database
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.2
    restart: always
    ports:
      - "6379:6379"

  web:
    build: .
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - MONGO_HOST=db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./media:/app/media

volumes:
  mongo_data:
```

## 环境变量文件 (.env)
```env
# Django配置
SECRET_KEY=your-very-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MongoDB配置
MONGO_DB_NAME=wms_database
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USERNAME=
MONGO_PASSWORD=

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# 文件存储配置
MEDIA_ROOT=/app/media
MAX_FILE_SIZE=10485760

# 安全配置
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## API响应格式示例

### 成功响应
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "商品名称",
        "code": "PROD001"
    }
}
```

### 错误响应
```json
{
    "code": 400,
    "message": "请求参数错误",
    "errors": {
        "name": ["商品名称不能为空"],
        "price": ["价格必须大于0"]
    }
}
```

### 列表响应
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "count": 100,
        "next": "http://api.example.com/products/?page=2",
        "previous": null,
        "results": [
            {
                "id": 1,
                "name": "商品1",
                "code": "PROD001"
            }
        ]
    }
}
```

这些配置文件为Django+MongoDB后端项目提供了完整的基础架构设置。 