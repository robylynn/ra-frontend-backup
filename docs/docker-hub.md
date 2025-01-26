# Docker Hub Setup
We have a docker hub free account. The credentials are:
Username: robylynn
Password: R2.Labs.2024!

Log into the R2 docker hub account by
```
docker login -u robylynn
```

## Building images for docker hub
The `docker-compose.local.yml` file contains the build instructions for the frontend and backend portions of the RA user interface application. The `platforms` section allows building for both `x86` and `arm64`. I haven't been able to get multi-arch builds to work properly with `docker compose` yet, so we will do it manually with `docker buildx`.

To enable multi-architecture builds, set up the [QEMU container](https://stackoverflow.com/questions/60080264/docker-cannot-build-multi-platform-images-with-docker-buildx),
```
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker buildx rm builder
docker buildx create --name builder --driver docker-container --use
docker buildx inspect --bootstrap
```

We can build the `ra_frontend` and `ra_backend` images for these architectures on the development PC and then push them to docker hub so they don't need to be rebuilt on the Jetson (which can take a long time). Once the QEMU container is set up and you are logged in to docker, build the images
```
./scripts/build_images.sh
```

## Deploying
Built images on our docker hub can be pulled (with an internet connection) and run on the target using the `docker-compose.hub.yml` file,
```
./run_containers.sh
```