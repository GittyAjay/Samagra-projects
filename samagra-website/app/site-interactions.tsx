'use client';

import { useEffect } from 'react';

export function SiteInteractions() {
  useEffect(() => {
    const nav = document.querySelector('nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = [...document.querySelectorAll('.nav-links a')];
    const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)')];
    const sections = [...document.querySelectorAll<HTMLElement>('section[id]')];
    const tabs = [...document.querySelectorAll<HTMLElement>('.consultation-tab')];
    const options = [...document.querySelectorAll<HTMLElement>('.bill-option')];
    const form = document.getElementById('consultationForm') as HTMLFormElement | null;
    const toast = document.getElementById('toast');

    const nameLabel = document.getElementById('nameLabel');
    const nameInput = document.getElementById('nameInput') as HTMLInputElement | null;
    const phoneLabel = document.getElementById('phoneLabel');
    const phoneInput = document.getElementById('phoneInput') as HTMLInputElement | null;
    const emailInput = document.getElementById('emailInput') as HTMLInputElement | null;
    const pinLabel = document.getElementById('pinLabel');
    const pinInput = document.getElementById('pinInput') as HTMLInputElement | null;
    const billLabel = document.getElementById('billLabel');
    const orgGroup = document.getElementById('orgGroup') as HTMLElement | null;
    const orgInput = document.getElementById('orgInput') as HTMLInputElement | null;
    const aptGroup = document.getElementById('aptGroup') as HTMLElement | null;
    const aptInput = document.getElementById('aptInput') as HTMLInputElement | null;
    const monthlyBillInput = document.getElementById('monthlyBillInput') as HTMLInputElement | null;
    const roofAreaInput = document.getElementById('roofAreaInput') as HTMLInputElement | null;
    const estimatedSystemSize = document.getElementById('estimatedSystemSize');
    const estimatedProjectPrice = document.getElementById('estimatedProjectPrice');
    const estimatedAnnualSavings = document.getElementById('estimatedAnnualSavings');
    const estimatedPayback = document.getElementById('estimatedPayback');
    const estimatedMonthlyOffset = document.getElementById('estimatedMonthlyOffset');
    const estimatedPriceNote = document.getElementById('estimatedPriceNote');
    const estimatedSavingsNote = document.getElementById('estimatedSavingsNote');
    const estimatedPaybackNote = document.getElementById('estimatedPaybackNote');
    const calculatorNote = document.getElementById('calculatorNote');
    const calculatorConsultationCta = document.getElementById('calculatorConsultationCta') as HTMLButtonElement | null;

    const fieldConfig = {
      residential: {
        name: { label: 'Homeowner Name', placeholder: 'Enter your full name' },
        phone: { label: 'WhatsApp Primary', placeholder: 'Enter your WhatsApp number' },
        pin: { label: 'Area Pin Code', placeholder: 'Enter your pin code' },
        bill: 'Monthly Current Bill',
        showOrg: false,
        showApt: false,
      },
      housing: {
        name: { label: 'Society Official Name', placeholder: 'Enter society name' },
        phone: { label: 'Society Contact Number', placeholder: 'Enter official mobile' },
        pin: { label: 'Society Location PIN', placeholder: 'Enter area pin' },
        bill: 'Common Area Utility Bill',
        showOrg: false,
        showApt: true,
      },
      commercial: {
        name: { label: 'Business Representative', placeholder: 'Enter contact person' },
        phone: { label: 'Company WhatsApp', placeholder: 'Enter business contact' },
        pin: { label: 'Industry Zone PIN', placeholder: 'Enter business location pin' },
        bill: 'Enterprise Energy Bill',
        showOrg: true,
        showApt: false,
      },
    } as const;
    type ConsultationType = keyof typeof fieldConfig;

    const monthlyBillMap: Record<string, number> = {
      '<1500': 1200,
      '1500-2500': 2000,
      '2500-4000': 3250,
      '4000-8000': 6000,
      '>8000': 9000,
    };

    const billBuckets = [
      { value: '<1500', max: 1500 },
      { value: '1500-2500', max: 2500 },
      { value: '2500-4000', max: 4000 },
      { value: '4000-8000', max: 8000 },
      { value: '>8000', max: Number.POSITIVE_INFINITY },
    ] as const;

    const tariffMap: Record<ConsultationType, number> = {
      residential: 8,
      housing: 9,
      commercial: 9.5,
    };

    const pricePerKwMap: Record<ConsultationType, number> = {
      residential: 65000,
      housing: 58000,
      commercial: 60000,
    };

    const annualSavingsMultiplier: Record<ConsultationType, number> = {
      residential: 0.84,
      housing: 0.8,
      commercial: 0.78,
    };

    const subsidyPerKwMap: Partial<Record<ConsultationType, number>> = {
      residential: 18000,
    };

    type EstimateSnapshot = {
      monthlyBill: number;
      roofArea: number;
      recommendedKw: number;
      grossPrice: number;
      subsidy: number;
      netPrice: number;
      annualSavings: number;
      paybackYears: number;
      fitsRoof: boolean;
      type: ConsultationType;
    };

    let latestEstimate: EstimateSnapshot = {
      monthlyBill: 3250,
      roofArea: 450,
      recommendedKw: 3,
      grossPrice: 195000,
      subsidy: 54000,
      netPrice: 141000,
      annualSavings: 32760,
      paybackYears: 4.3,
      fitsRoof: true,
      type: 'residential',
    };

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);

    const formatCompactCurrency = (value: number) => {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)}L`;
      }

      if (value >= 1000) {
        return `₹${Math.round(value / 1000)}K`;
      }

      return formatCurrency(value);
    };

    const roundToHalf = (value: number) => Math.max(1, Math.round(value * 2) / 2);

    const normalizeIndianPhone = (value: string) => value.replace(/[^\d+]/g, '').trim();
    const normalizeIndianPin = (value: string) => value.replace(/\D/g, '').slice(0, 6);

    const isValidIndianMobileNumber = (value: string) => /^(?:\+91|91)?[6-9]\d{9}$/.test(value.replace(/\s+/g, ''));
    const isValidIndianPinCode = (value: string) => /^[1-9][0-9]{5}$/.test(value);

    const getActiveType = (): ConsultationType =>
      (tabs.find((tab) => tab.classList.contains('active'))?.dataset.type as ConsultationType | undefined) ??
      'residential';

    const getBillBucket = (bill: number) =>
      billBuckets.find((bucket) => bill <= bucket.max)?.value ?? '2500-4000';

    const syncBillSelection = (bill: number) => {
      const bucket = getBillBucket(bill);

      options.forEach((option) => {
        option.classList.toggle('active', option.dataset.value === bucket);
      });
    };

    const scrollToConsultation = () => {
      document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const setActiveType = (type: ConsultationType) => {
      tabs.forEach((item) => item.classList.toggle('active', item.dataset.type === type));
      applyConsultationType(type);
    };

    const onScroll = () => {
      if (!nav) {
        return;
      }

      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      nav.classList.toggle('nav-scrolled', y > 8);

      if (sections.length && sectionLinks.length) {
        const activeY = window.scrollY + 120;
        let currentId = sections[0]?.id ?? '';

        for (const section of sections) {
          if (activeY >= section.offsetTop) {
            currentId = section.id;
          }
        }

        sectionLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${currentId}`;
          link.classList.toggle('active', isActive);
        });
      }
    };

    const onToggleClick = () => {
      if (!nav || !toggle) {
        return;
      }

      const isOpen = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    const onOutsideClick = (event: MouseEvent) => {
      if (!nav || !toggle || !nav.classList.contains('nav-open')) {
        return;
      }

      if (!nav.contains(event.target as Node)) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    const closeMobileNav = () => {
      if (!nav || !toggle) {
        return;
      }

      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const applyConsultationType = (type: keyof typeof fieldConfig) => {
      const config = fieldConfig[type];

      if (nameLabel) {
        nameLabel.innerHTML = `${config.name.label}<span>*</span>`;
      }
      if (nameInput) {
        nameInput.placeholder = config.name.placeholder;
      }
      if (phoneLabel) {
        phoneLabel.innerHTML = `${config.phone.label}<span>*</span>`;
      }
      if (phoneInput) {
        phoneInput.placeholder = config.phone.placeholder;
      }
      if (pinLabel) {
        pinLabel.innerHTML = `${config.pin.label}<span>*</span>`;
      }
      if (pinInput) {
        pinInput.placeholder = config.pin.placeholder;
      }
      if (billLabel) {
        billLabel.textContent = config.bill;
      }
      if (orgGroup) {
        orgGroup.style.display = config.showOrg ? 'block' : 'none';
      }
      if (orgInput) {
        orgInput.required = config.showOrg;
      }
      if (aptGroup) {
        aptGroup.style.display = config.showApt ? 'block' : 'none';
      }
      if (aptInput) {
        aptInput.required = config.showApt;
      }

      updateCalculatorEstimate();
    };

    const showToast = (message: string, isError = false) => {
      if (!toast) {
        return;
      }

      toast.textContent = message;
      toast.style.background = isError ? '#b91c1c' : '#FF8C00';
      toast.classList.add('show');

      window.setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    };

    const updateCalculatorEstimate = () => {
      const type = getActiveType();
      const monthlyBill = Math.max(Number(monthlyBillInput?.value || 3250), 500);
      const roofArea = Math.max(Number(roofAreaInput?.value || 450), 80);
      const monthlyUnits = monthlyBill / tariffMap[type];
      const billDrivenKw = roundToHalf(monthlyUnits / 120);
      const roofLimitedKw = Math.max(1, Math.floor((roofArea / 90) * 2) / 2);
      const recommendedKw = Math.max(1, Math.min(billDrivenKw, roofLimitedKw));
      const grossPrice = Math.round(recommendedKw * pricePerKwMap[type]);
      const subsidy = Math.round(
        type === 'residential' ? Math.min(78000, recommendedKw * (subsidyPerKwMap[type] ?? 0)) : 0
      );
      const netPrice = Math.max(grossPrice - subsidy, 0);
      const annualSavings = Math.round(monthlyBill * 12 * annualSavingsMultiplier[type]);
      const paybackYears = annualSavings > 0 ? netPrice / annualSavings : 0;
      const fitsRoof = roofLimitedKw >= billDrivenKw;

      latestEstimate = {
        monthlyBill,
        roofArea,
        recommendedKw,
        grossPrice,
        subsidy,
        netPrice,
        annualSavings,
        paybackYears,
        fitsRoof,
        type,
      };

      if (estimatedSystemSize) {
        estimatedSystemSize.textContent = `${recommendedKw.toFixed(1)} kW`;
      }

      if (estimatedProjectPrice) {
        estimatedProjectPrice.textContent = formatCompactCurrency(netPrice || grossPrice);
      }

      if (estimatedAnnualSavings) {
        estimatedAnnualSavings.textContent = formatCompactCurrency(annualSavings);
      }

      if (estimatedPayback) {
        estimatedPayback.textContent = `${Math.max(paybackYears, 2).toFixed(1)} yrs`;
      }

      if (estimatedMonthlyOffset) {
        estimatedMonthlyOffset.textContent = fitsRoof
          ? `Sized to offset a ${formatCurrency(monthlyBill)}/month electricity pattern.`
          : `Roof area caps the estimate at ${recommendedKw.toFixed(1)} kW right now.`;
      }

      if (estimatedPriceNote) {
        estimatedPriceNote.textContent =
          subsidy > 0
            ? `${formatCurrency(grossPrice)} before incentives, about ${formatCurrency(netPrice)} after subsidy.`
            : `${formatCurrency(grossPrice)} estimated turnkey project budget for this use case.`;
      }

      if (estimatedSavingsNote) {
        estimatedSavingsNote.textContent = `This estimate assumes a ${Math.round(
          annualSavingsMultiplier[type] * 100
        )}% reduction in annual grid spend.`;
      }

      if (estimatedPaybackNote) {
        estimatedPaybackNote.textContent = fitsRoof
          ? 'A practical range your consultant can validate after reviewing your site.'
          : 'A site visit can unlock alternate layouts or higher-yield panel options.';
      }

      if (calculatorNote) {
        calculatorNote.textContent = fitsRoof
          ? `We will attach this ${recommendedKw.toFixed(1)} kW estimate to your consultation request so the team can start with a sharper proposal.`
          : `Your bill suggests a larger system, but the current roof area points to about ${recommendedKw.toFixed(
              1
            )} kW. Our team can suggest structure changes or alternate layouts during consultation.`;
      }

      syncBillSelection(monthlyBill);
    };

    const observer =
      typeof window !== 'undefined' && 'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('on');
                }
              });
            },
            { threshold: 0.1 }
          )
        : null;

    document.querySelectorAll('.fade-up,.fade-left,.fade-right').forEach((element) => {
      observer?.observe(element);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    window.addEventListener('resize', onScroll);
    window.addEventListener('click', onOutsideClick);
    onScroll();

    toggle?.addEventListener('click', onToggleClick);
    links.forEach((link) => link.addEventListener('click', closeMobileNav));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setActiveType(tab.dataset.type as ConsultationType);
      });
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        options.forEach((item) => item.classList.remove('active'));
        option.classList.add('active');
        if (monthlyBillInput) {
          monthlyBillInput.value = String(monthlyBillMap[option.dataset.value || '2500-4000'] ?? 3250);
        }
        updateCalculatorEstimate();
      });
    });

    monthlyBillInput?.addEventListener('input', updateCalculatorEstimate);
    roofAreaInput?.addEventListener('input', updateCalculatorEstimate);
    calculatorConsultationCta?.addEventListener('click', scrollToConsultation);
    phoneInput?.addEventListener('input', () => {
      phoneInput.setCustomValidity('');
      phoneInput.value = normalizeIndianPhone(phoneInput.value);
    });
    pinInput?.addEventListener('input', () => {
      pinInput.setCustomValidity('');
      pinInput.value = normalizeIndianPin(pinInput.value);
    });

    const onSubmit = async (event: Event) => {
      event.preventDefault();
      const button = form?.querySelector('.btn-submit') as HTMLButtonElement | null;
      const activeTab = tabs.find((tab) => tab.classList.contains('active'));
      const activeBill = options.find((option) => option.classList.contains('active'));

      if (!form || !button || !nameInput || !phoneInput || !emailInput || !pinInput || !activeTab || !activeBill) {
        showToast('The enquiry form is not ready yet. Please refresh and try again.', true);
        return;
      }

      const normalizedPhone = normalizeIndianPhone(phoneInput.value);

      if (!isValidIndianMobileNumber(normalizedPhone)) {
        phoneInput.setCustomValidity('Enter a valid Indian mobile number, like 9876543210 or +919876543210.');
        phoneInput.reportValidity();
        return;
      }

      const normalizedPin = normalizeIndianPin(pinInput.value);

      if (!isValidIndianPinCode(normalizedPin)) {
        pinInput.setCustomValidity('Enter a valid 6-digit Indian PIN code.');
        pinInput.reportValidity();
        return;
      }

      phoneInput.setCustomValidity('');
      pinInput.setCustomValidity('');
      phoneInput.value = normalizedPhone;
      pinInput.value = normalizedPin;

      button.disabled = true;
      button.textContent = 'Submitting...';

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'landing_page',
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            phone: phoneInput.value.trim(),
            address: `PIN ${pinInput.value.trim()}`,
            roofType: activeTab.dataset.type === 'housing' ? 'society rooftop' : activeTab.dataset.type || 'rooftop',
            monthlyElectricityBill: latestEstimate.monthlyBill,
            requiredLoadKw: latestEstimate.recommendedKw,
            taskType: latestEstimate.type === 'housing' ? 'survey' : 'sales',
            notes: [
              orgInput?.value.trim() ? `Organization: ${orgInput.value.trim()}` : '',
              aptInput?.value.trim() ? `Total apartments: ${aptInput.value.trim()}` : '',
              `Landing page enquiry type: ${activeTab.dataset.type || 'residential'}`,
              `Calculator bill: ${formatCurrency(latestEstimate.monthlyBill)}`,
              `Calculator roof area: ${latestEstimate.roofArea} sq ft`,
              `Calculator recommendation: ${latestEstimate.recommendedKw.toFixed(1)} kW`,
              `Estimated project price: ${formatCurrency(latestEstimate.netPrice || latestEstimate.grossPrice)}`,
              `Estimated annual savings: ${formatCurrency(latestEstimate.annualSavings)}`,
            ]
              .filter(Boolean)
              .join(' | '),
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { statusMessage?: string; message?: string; lead?: { id?: string } }
          | null;

        if (!response.ok) {
          throw new Error(payload?.statusMessage || payload?.message || 'Could not submit your enquiry.');
        }

        showToast('Thanks, we received your request and will contact you soon.');
        form.reset();
        setActiveType('residential');
        if (monthlyBillInput) {
          monthlyBillInput.value = '3200';
        }
        if (roofAreaInput) {
          roofAreaInput.value = '450';
        }
        updateCalculatorEstimate();
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Could not submit your enquiry.', true);
      } finally {
        button.disabled = false;
        button.textContent = 'Submit Details';
      }
    };

    form?.addEventListener('submit', onSubmit);
    setActiveType('residential');
    updateCalculatorEstimate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('load', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('click', onOutsideClick);
      toggle?.removeEventListener('click', onToggleClick);
      links.forEach((link) => link.removeEventListener('click', closeMobileNav));
      form?.removeEventListener('submit', onSubmit);
      monthlyBillInput?.removeEventListener('input', updateCalculatorEstimate);
      roofAreaInput?.removeEventListener('input', updateCalculatorEstimate);
      calculatorConsultationCta?.removeEventListener('click', scrollToConsultation);
      observer?.disconnect();
    };
  }, []);

  return null;
}
