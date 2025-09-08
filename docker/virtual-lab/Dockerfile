# Virtual Labs Docker Configuration
FROM alpine:latest

# Install essential penetration testing tools
RUN apk update && apk add --no-cache \
    bash \
    curl \
    wget \
    nmap \
    netcat-openbsd \
    whois \
    dig \
    john \
    sqlmap \
    nikto \
    dirb \
    hydra \
    metasploit-framework \
    wireshark \
    tcpdump \
    ettercap \
    aircrack-ng \
    hashcat \
    binwalk \
    steghide \
    exiftool \
    python3 \
    python3-pip \
    nodejs \
    npm \
    git \
    vim \
    nano \
    tmux \
    htop \
    net-tools \
    openssh \
    openssl

# Install Python security tools
RUN pip3 install --no-cache-dir \
    scapy \
    requests \
    beautifulsoup4 \
    paramiko \
    pycrypto \
    hashlib \
    socket \
    subprocess

# Create lab workspace
RUN mkdir -p /labs/workspace /labs/tools /labs/targets

# Add vulnerable applications for practice
WORKDIR /labs/targets

# Clone vulnerable web applications
RUN git clone https://github.com/WebGoat/WebGoat.git && \
    git clone https://github.com/digininja/DVWA.git && \
    git clone https://github.com/bWAPP/bWAPP.git

# Set up lab environment
WORKDIR /labs/workspace

# Create lab scripts directory
RUN mkdir -p /labs/scripts

# Copy lab exercise scripts
COPY lab-scripts/ /labs/scripts/
RUN chmod +x /labs/scripts/*.sh

# Expose ports for vulnerable applications
EXPOSE 8080 80 443 21 22 23 25 53 110 143 993 995

# Set default shell
SHELL ["/bin/bash", "-c"]

# Create non-root lab user
RUN adduser -D -s /bin/bash labuser && \
    echo "labuser:password123" | chpasswd && \
    addgroup labuser wheel

# Switch to lab user
USER labuser
WORKDIR /home/labuser

# Set up lab environment variables
ENV LAB_HOME=/home/labuser
ENV PATH=$PATH:/labs/tools:/labs/scripts

CMD ["/bin/bash"]
